BUN ?= bun

.PHONY: help
help: ## show this message
	@echo "Usage: make [target1] (target2) ..."
	@echo ""
	@echo "Commands/Targets:"
	@grep -E '(^[a-zA-Z0-9_%-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-20s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'
	@echo ""
	@echo "Environment:"
	@grep -E '^[a-zA-Z0-9_-]+\s*[?:]?=.*$$' $(MAKEFILE_LIST) | grep -Eo '^[a-zA-Z0-9_-]+' | xargs -I {} make -s print-{}

.PHONY: print-%
print-%:
	@echo -e '\033[32m$*\033[0m = $($*)'

node_modules: bun.lock
	@$(BUN) install

build: node_modules ## build static site in "dist"
	@$(BUN) run build

.PHONY: dev
dev: node_modules ## run dev version of static site
	@$(BUN) run dev

lint: node_modules ## lint code
	@$(BUN) run lint
	@$(BUN) run type-check

format: node_modules ## fix and reformat code
	@$(BUN) run format
	@$(BUN) run lint-fix

update-template: ## fetch and merge core changes from template
	@(git remote | grep template &>/dev/null) || git remote add template https://github.com/klemek/vue-boilerplate.git
	git fetch template
	git merge template/master --allow-unrelated-histories


