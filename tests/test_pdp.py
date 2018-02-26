from pdp import _parse_version

import pytest


@pytest.mark.parametrize(('type_', 'version_string', 'expected_result'), (
    ('revision', '2.3.6+feature.show.dev.branch.7082a0',
     'feature.show.dev.branch:7082a0'),
    ('revision', '2.3.6+my.branch.123456', 'my.branch:123456'),
    ('revision', '2.3.6+branch.123456', 'branch:123456'),
    ('revision', '1.0+master.123456', 'master:123456'),
    ('revision', '3.1+23456', 'unknown'),
    ('revision', '3+feature/foo.123456', 'feature/foo:123456'),
    ('version', '2.3.6+feature.show.dev.branch.7082a0', '2.3.6'),
    ('version', '2.3.6+my.branch.123456', '2.3.6'),
    ('version', '2.3.6+branch.123456', '2.3.6'),
    ('version', '1.0+master.123456', '1.0'),
    ('version', '3.1+23456', 'unknown'),
    ('version', '3+feature/foo.123456', '3'),
))
def test_parse_version(type_, version_string, expected_result):
    assert _parse_version(version_string, type_) == expected_result
