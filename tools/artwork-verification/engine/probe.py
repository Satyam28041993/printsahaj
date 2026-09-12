"""Convenience entry point so the probe can be run from the engine folder.

    python probe.py ../samples/kalonji
"""

from printsahaj_verify.probe import main

if __name__ == "__main__":
    raise SystemExit(main())
