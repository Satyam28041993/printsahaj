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


def points_to_mm(points: float) -> float:
    """Convert a PDF user-space measurement in points to millimetres."""
    return points * MM_PER_POINT
