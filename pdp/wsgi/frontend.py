from pdp import get_config
from pdp.main import initialize_frontend

global_config = get_config()

app = initialize_frontend(
    global_config,
    use_analytics=global_config['use_analytics']
)
