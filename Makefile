ifeq ($(shell which bun &>/dev/null && echo 1 || echo 0), 1)
	NPM ?= bun
endif

NPM ?= npm

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

build: ## build static site in "dist"
	@$(NPM) run build

.PHONY: run
def: ## run dev version of static site
	@$(NPM) run dev

lint: ## lint code
	@$(NPM) run lint

fix: ## fix and reformat code
	@$(NPM) run format
	@$(NPM) run lint-fix

update-template: ## update code from template
	@(git remote | grep template &>/dev/null) || git remote add template https://github.com/klemek/vue-boilerplate.git
	git fetch template
	git merge template/master --allow-unrelated-histories


