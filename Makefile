#!/usr/bin/env make -f
# -*- makefile -*-

SHELL = bash -e
PROJECT_NAME ?= mash-website
HOST_UID ?= $(shell id -u)
HOST_GID ?= $(shell id -g)
export HOST_UID HOST_GID

COMPOSE = docker compose -p $(PROJECT_NAME) -f docker-compose.yml
exec_on_docker = $(COMPOSE) exec app

.PHONY: help image start stop down dependencies serve build lint format test console

help:
	@echo "Available commands:"
	@echo "  image         - Build the dev image"
	@echo "  start         - Start the container"
	@echo "  stop          - Stop the container"
	@echo "  down          - Stop and remove the container"
	@echo "  dependencies  - npm ci inside the container"
	@echo "  serve         - next dev on 0.0.0.0:3000"
	@echo "  build         - next build inside the container"
	@echo "  lint          - eslint inside the container"
	@echo "  format        - prettier inside the container"
	@echo "  test          - type-check inside the container"
	@echo "  console       - bash shell inside the container"

image:
	@$(COMPOSE) build

start:
	@$(COMPOSE) up --detach --wait

stop:
	@$(COMPOSE) stop

down:
	@$(COMPOSE) down --remove-orphans

dependencies: start
	@$(exec_on_docker) npm ci

serve: start
	@$(exec_on_docker) npm run dev -- -H 0.0.0.0

build: start
	@$(exec_on_docker) npm run build

lint: start
	@$(exec_on_docker) npm run lint

format: start
	@$(exec_on_docker) npm run format

test: start
	@$(exec_on_docker) npm run type-check

console: start
	@$(exec_on_docker) bash
