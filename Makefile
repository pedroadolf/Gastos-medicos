.PHONY: init run test clean status

init: install.sh
	./install.sh

run:
	source venv/bin/activate && python src/main.py

test:
	source venv/bin/activate && pytest src/ -v

status:
	git status && tree -L 2

clean:
	rm -rf venv/ artifacts/ .env

# Secuencia completa
full: init run test
