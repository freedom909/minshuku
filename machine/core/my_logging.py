# core/my_logging.py
import logging
import sys

logger = logging.getLogger("minshuku")
logger.setLevel(logging.DEBUG)

# Console handler
ch = logging.StreamHandler(sys.stdout)
ch.setLevel(logging.DEBUG)

# File handler
fh = logging.FileHandler("minshuku.log")
fh.setLevel(logging.INFO)

# Formatter
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
ch.setFormatter(formatter)
fh.setFormatter(formatter)

# Add handlers
logger.addHandler(ch)
logger.addHandler(fh)
