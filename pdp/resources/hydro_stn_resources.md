# Hydro Station Resources

This directory contains two yaml files, each of which configures pydap to serve the
csv files contained in a particular directory. Each Routed Streamflow Portal has its
own directory, which should contain each datafiles described in that portal's
station metadata CSV, and ideally no additional files.

## Datafile Format

Note that the required formatting for CSV datafiles to be *read* by the PDP differs somewhat
from the format of the CSV *written* by the PDP when a user downloads data in CSV format.

The data reader relies on quoting to distinguish numeric and non-numeric data, so 
all non-numeric items in the CSV datafiles, including timestamps, must be double-quoted. 

Column headers should be double-quoted.

The timestamp column should be named `Date`; date entries should be formatted `YYYY/MM/DD`
and double-quoted.

Numeric values should be formatted as unquoted floats.

**Example datafile:**
```
"Date","ACCESS1-0_rcp45_r1i1p1","CanESM2_rcp45_r1i1p1","CCSM4_rcp45_r2i1p1"
"1945/01/01",16.302433013916,16.3024291992188,16.3024291992188
"1945/01/02",27.158052444458,27.1608219146729,27.1580505371094
"1945/01/03",28.3629970550537,28.3656997680664,28.3629970550537
"1945/01/04",28.4734115600586,28.4742069244385,28.4734115600586
```