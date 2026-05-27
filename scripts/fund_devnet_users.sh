#!/usr/bin/env bash
set -euo pipefail

ADMIN_PRIVATE_KEY="APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH"
ENDPOINT="http://localhost:3030"
NETWORK="testnet"
AMOUNT="100000000u64"

USERS=(
  "aleo18a3ugz8du4lshegzr6kdgyn0g56yeduyuvhe4554spjm2dh2wyyst82ywa"
  "aleo1ym34ds9sfp2qawnm79whxl06gr4glsnfekzw2g2q420u9ns75yrqgzc560"
  "aleo1c46twlnfs29u8ed677v6mcu3tgwxy679290xhqlfpg56gnf28ypsxu7udh"
  "aleo1g5669kagrmgdwe6x3rj3vl6jvm9d4panw4lqucvdfw9gq83kdvzsejmhf9"
  "aleo1n26qmjzs05hkhgncqrx5vsumnd0dpqx5yhp0kwgupzygh74rsqgqw464um"
  "aleo1s3erdtdsuelhykfgds6ft64eynhag0e0vgsph6dmf7qvu6dpfyyqjraep5"
  "aleo1hcd7le4c20cd4s3sj2d7klnrplsuc5aq9h4a530xgl3fkj80yygsjusljp"
  "aleo1rkgu7sc2m75ye5s0ksezzelz37jmsmu0lwxxh60ka6ws5jmq25zsr28um6"
  "aleo1ju6f5p7c0vwn9rm0786s359xh7wf5mplutey5ml7wtzqvy0gjszqd2tduj"
  "aleo18dzz923ynh933htdc0mvptum7hp0exqvrygv52x36ck23rk8msxs4alca6"
)

for USER in "${USERS[@]}"; do
  echo "Funding ${USER} with ${AMOUNT}"

  leo execute credits.aleo/transfer_public \
    "$USER" \
    "$AMOUNT" \
    --network "$NETWORK" \
    --endpoint "$ENDPOINT" \
    --devnet \
    --private-key "$ADMIN_PRIVATE_KEY" \
    --broadcast \
    --yes

  echo "Funded ${USER}"
  echo
done
