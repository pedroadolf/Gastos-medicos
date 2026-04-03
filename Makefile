.PHONY: init dev build test clean status

init:
	npm install && cd apps/agent && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt

dev:
	npm run dev

build:
	npm run build

test:
	npm test

status:
	git status && ls -R apps/ workflows/ supabase/

clean:
	npm run clean
	rm -rf apps/agent/venv
	rm -rf artifacts/
