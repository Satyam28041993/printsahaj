"""Named constants shared across the verifier.

No magic numbers anywhere else in the package — if a number carries meaning,
it is defined here with the reason it has that value.
"""

# Flexo cylinder gearing. A cylinder repeat must be a whole number of teeth,
# and one tooth is 1/8 inch.
CIRCULAR_PITCH_MM: float = 3.175

# PDF user space is measured in points.
POINTS_PER_INCH: float = 72.0
MM_PER_INCH: float = 25.4

#: Multiply a value in points by this to get millimetres.
MM_PER_POINT: float = MM_PER_INCH / POINTS_PER_INCH

# Floating point comparisons on physical measurements. Plate and cylinder
# dimensions are quoted to three decimals at most, so a tolerance of one
# micrometre is well below anything the trade can measure.
MEASUREMENT_TOLERANCE_MM: float = 0.001

# Desk thumbnail: render the first page (or the image) no wider than this.
PREVIEW_MAX_WIDTH_PX: int = 900
# Tiny pages would otherwise be scaled up into huge pixmaps.
PREVIEW_MAX_ZOOM: float = 4.0
# Full preview / compare window. Text on a wide imposition must stay readable.
PREVIEW_MIN_WIDTH_PX: int = 200
VIEWER_MAX_WIDTH_PX: int = 2800
VIEWER_MAX_ZOOM: float = 8.0
# Green punch-line frames around each label on a vendor composite.
PUNCH_SIZE_TOLERANCE_MM: float = 12.0
PUNCH_GREEN_MIN_G: float = 0.45
PUNCH_GREEN_RATIO: float = 1.25
PUNCH_MIN_AREA_MM2: float = 800.0


def points_to_mm(points: float) -> float:
    """Convert a PDF user-space measurement in points to millimetres."""
    return points * MM_PER_POINT
