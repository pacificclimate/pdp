#!/bin/bash

# Install project from local codebase
pip install -r requirements.txt -r test_requirements.txt -r deploy_requirements.txt
pip install -e .

/bin/bash
