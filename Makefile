.PHONY: help install dev test lint format clean build deploy

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

dev: ## Start development servers
	@echo "Starting backend server..."
	cd backend/src/lok_backend && python run.py &
	@echo "Starting frontend server..."
	cd frontend && npm run dev

test: ## Run all tests
	cd backend && python -m pytest tests/
	cd frontend && npm test

lint: ## Run linting
	cd backend && flake8 src/
	cd frontend && npm run lint

format: ## Format code
	cd backend && black src/ && isort src/
	cd frontend && npm run format

clean: ## Clean build artifacts
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	cd frontend && rm -rf dist/ build/

build: ## Build for production
	cd frontend && npm run build
	cd backend && pip install --upgrade pip

deploy: build ## Deploy to production
	@echo "Deploying to production..."
	./scripts/deploy-production.sh