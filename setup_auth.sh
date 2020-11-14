#!/bin/sh

set -e pipefail


KEYCLOAK="http://localhost:8080"
REALM="master"

CLIENT='{
    "id": "1f9e3fcd-287c-45cf-9018-594d4406cd23",
    "clientId": "peak-cart",
    "enabled": true,
    "directAccessGrantsEnabled": true,
    "standardFlowEnabled": false,
    "publicClient": false,
    "attributes": {
        "access.token.signed.response.alg": "RS256"
    }
}'

REGISTER_URL="$KEYCLOAK/auth/admin/realms/$REALM/clients/"
TOKEN_URL="$KEYCLOAK/auth/realms/$REALM/protocol/openid-connect/token"

echo "Getting access token"
TOKEN=$(curl -X POST -s \
    -H 'application/x-www-form-urlencoded' \
    --data-urlencode "client_id=admin-cli"\
    --data-urlencode "grant_type=password"\
    --data-urlencode "username=admin"\
    --data-urlencode "password=admin"\
    "$TOKEN_URL" | jq -r .access_token)


echo "Creating client peak-cart"
curl -X POST \
    -d "$CLIENT" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    "$REGISTER_URL"

echo "Writing public certificate to cert.pem"
echo "-----BEGIN CERTIFICATE-----" > cert.pem
curl -s "$KEYCLOAK/auth/realms/$REALM/protocol/openid-connect/certs" \
    | jq -r '.keys[] | select (.alg == "RS256") | .x5c[0]' >> cert.pem
echo "-----END CERTIFICATE-----" >> cert.pem


echo "Getting client secret"
SECRET=$(curl -s \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    "$KEYCLOAK/auth/admin/realms/$REALM/clients/1f9e3fcd-287c-45cf-9018-594d4406cd23/client-secret" \
    | jq -r .value)


echo
echo "SUCCESS"
echo
echo "Fetch new JWT with:"

cat << EOF 
TOKEN=\$(curl -s -L -X POST '$KEYCLOAK/auth/realms/master/protocol/openid-connect/token' \\
    -H 'Content-Type: application/x-www-form-urlencoded' \\
    --data-urlencode 'client_id=peak-cart' \\
    --data-urlencode 'grant_type=password' \\
    --data-urlencode 'client_secret=$SECRET' \\
    --data-urlencode 'scope=openid' \\
    --data-urlencode 'username=admin' \\
    --data-urlencode 'password=admin' | jq -r '.access_token')
EOF

echo "Then query the application with:"

echo 'curl -H "Authorization: Bearer ${TOKEN}" localhost:3000'
