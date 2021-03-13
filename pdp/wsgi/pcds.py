from pdp import get_config
from pdp.portals.pcds import mk_backend

app = mk_backend(get_config())
