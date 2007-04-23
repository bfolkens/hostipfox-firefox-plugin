#!/bin/sh

OLDVER=$1
NEWVER=$2
if [ $# -lt 2 ]; then
	echo "Usage: $0 oldver_regex newver"
	exit 255
fi

for fname in `grep -lR "${OLDVER}" ./ | grep -v "\.svn\|changever\.sh\|CHANGELOG\|\/downloads\/"`
do
	echo $fname
	sed "s/${OLDVER}/${NEWVER}/g" $fname > $fname.new
	mv -f $fname.new $fname
done
