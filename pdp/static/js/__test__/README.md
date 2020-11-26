# Testing Notes

## Portal-specific tests

When each portal is instantiated, it loads its default dataset, which can be found in the
javascript code for each portal. In order to completely and correctly load a dataset (and
therefore entire portal for testing), the front end will make several queries to data
services, all of which must be mocked with information for that particular dataset.

Please note that the testing harness does not set `url_base`, and portals instantiated for
testing purposes have a `$(location).href` value of `http://localhost/`. This means that
portals with an "archive" functionality that display two different sets of data but 
otherwise behave identically depending on the URL used to access them will always determine,
using `pdp_controls.isArchivePortal()`, that they are *not* currently displaying the
archived data, because the word "archive" is not present in their self-perceived URL when
instantiated by tests. Therefore, they will load the non-archive choice when loading their
default dataset for testing, and that is the dataset that needs to be mocked. Portals that
currently have "archive" functionality:
* `vic_app`
* `canada_ex_app`

### Backend Mocks For Portal-specific tests
#### getCatalog
A mockup of the backend's `catalog.json`. JSON object with {`unique_id`: `data_url`} entries.
The data urls should use the `data_root` set in `app-test-helper.js`. The default dataset needs
to have an entry, but does not need to be the only entry.

#### getRasterAccordionData
A mockup of the backend's `menu.json`. JSON Object with portal-specific organization of
datasets. The default dataset needs to be represented, but does not need to be the only entry.

#### getMetadata
A mockup if the backend's `metadata.json`. JSON object with `units`, `max`, and `min`
attributes for the default dataset.

#### getNcwmLayerDDS
A mockup of a pyDAP DDS call. Needs to match the `time` metadata for the default dataset.

#### getNcwmsLayerDAS
A mockup of a pyDAP DAS call. Probably needs to include `lat`, `lon`, `time` and a variable
matching the default dataset's variable, along with their load-bearing attributes like `units`,
but "extra" attributes like `REFERENCES` are probably skippable.

### ncWMS Mocks For Portal-Specific tests

Thankfully, full maps do not need to be loaded for tests, but some metadata is needed.

#### getNCWMSLayerCapabilities
A representation of ncWMS's `GetCapabilities` query, a very long xml document.
Needs to include, at minimum, the unique ID of the dataset in question, and the
default timestamp, which can be found in the portal's initialization javascript, 
in their usual places in the `<LAYER>` element.

The xml includes a long list of available palettes; all but the default one
specified in the portal's map initial code are skippable and do not need
to be mocked (`default/ferret`for most variables; `default/blueheat` for some
precipitation datasets, `default/occam` for some others).