[![Docker Publishing](https://github.com/pacificclimate/pdp/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/pacificclimate/pdp/actions/workflows/docker-publish.yml)
[![Node CI](https://github.com/pacificclimate/pdp/actions/workflows/node-ci.yml/badge.svg)](https://github.com/pacificclimate/pdp/actions/workflows/node-ci.yml)
[![Python CI](https://github.com/pacificclimate/pdp/actions/workflows/python-ci.yml/badge.svg)](https://github.com/pacificclimate/pdp/actions/workflows/python-ci.yml)

# `pdp` - PCIC Data Portal

The PCIC Data Portal contains the frontend code required for the [PCIC Data Portal](http://www.pacificclimate.org/data) as well as WSGI callables to deploy the entire application within a WSGI container.

## Documentation
- [Installation](docs/installation.md)
- [Deployment](docs/deployment.md)
- [Testing](docs/testing.md)
- [Separate-project portals and user documentation](docs/sep-proj-user-doc.md)
- [Notes](docs/notes.md)

## Changelog
To see the latest changes, vist our [`NEWS.md`](NEWS.md#news--release-notes) page.

## Releasing

To create a versioned release:

1. Increment `__version__` in `setup.py`
2. Summarize the changes from the last release in `NEWS.md`
3. Commit these changes, then tag the release:

    ```bash
    git add setup.py NEWS.md
    git commit -m"Bump to version x.x.x"
    git tag -a -m"x.x.x" x.x.x
    git push --follow-tags
    ```

## Related Projects
| Repo                                                         | Description                                                       |
| ------------------------------------------------------------ | ----------------------------------------------------------------- |
| [`pdp_util`](https://github.com/pacificclimate/pdp_util)     | A package supplying numerous apps for running PCIC's data server. |
| [`pdp-docker`](https://github.com/pacificclimate/pdp-docker) | Defines some common base images used in the PDP project.          |