from pdp import get_config
from pdp.portals.pcds import mk_backend

pcds_only = mk_backend(get_config())
