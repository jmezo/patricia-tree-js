#!/bin/sh
~/go/bin/geth \
	--datadir ./.leveldb/.devethereum \
	--vmdebug \
	--http \
	--http.corsdomain "https://remix.ethereum.org,http://remix.ethereum.org" \
	--http.api web3,eth,debug,personal,net \
	--dev
