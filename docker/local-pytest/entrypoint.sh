# Install PDP from local codebase
pip install -i https://pypi.pacificclimate.org/simple \
  -r requirements.txt -r test_requirements.txt -r deploy_requirements.txt
pip install -i https://pypi.pacificclimate.org/simple -e .

/bin/bash