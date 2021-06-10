import os


def test_secret():
    assert os.getenv("NOT_SECRET", "fail") != "fail"
    assert os.getenv("NOT_ANOTHER_SECRET", "fail") != "fail"