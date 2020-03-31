.PHONY: get-data
get-data:
	./get_data.sh

.PHONY: build
build:
	python -m covid_19.scrape > data.js

.PHONY: all
all: get-data build
