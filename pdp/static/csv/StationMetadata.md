# Station Metadata

This directory holds CSV resource files that contain metadata about the stations at which routed flow
data is available. This metadata is used by the Hydro Station portal to display stations for which a user
can download routed data.

The actual datafiles for each station are served by the backend. There should be a one-to-one
correspondance between stations listed in these CSVs and data files available for download.

Currently there is one Hydro Station portal. `hydro_stn_cmip5_metadata.csv` describes stations for the
`hydro_stn_cmip5` portal.

## Required Columns
These are the columns the front end requires. They can be in arbitrary order or interspersed with
additional columns (which will be ignored), but must be spelled and capitalized as follows.

### Latitude
Decimal degrees. No minutes or seconds. No `N` or `S`. Used to place a marker for the station
on the map.

### Longitude
Decimal degrees. No minutes or seconds. Should be negative for west values. No `E` or `W`. Used to
place a marker for the station on the map.

### FileName
The file that will be given to the user if they download data from this station.

Just the base name, matching a file that exists in the directory served by this portal's backend. 
Each portal serves data out of a different directory, which is configured by a yaml file in the
`pdp/resources` directory. 

### StationName
A description of the location of the station, something like "CAMPBELL RIVER AT STRATHCONA DAM". 
Displayed to the user when the station is selected.

### SiteID
An authoritative alphanumeric code for the station. Not displayed directly in the UI, but can be
searched for. Sometimes, but not always, the same as the FileName.
