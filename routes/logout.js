const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Failed to destroy session:", err);
      return res.status(500).json({
        success: false,
        message: "Logout failed",
      });
    }

    // Clear the session cookie
    res.clearCookie("connect.sid"); // Clear session cookie

    res.json({
      success: true,
      message: "Logged out successfully",
      logout: true,
    });
  });
};

module.exports = logout;
