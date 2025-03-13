const signinstep2 = async (req, res) => {
  try {
    function generateOTP() {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }
    const otp = generateOTP();

    res.json({ otp: otp });
  } catch (e) {
    console.log(e);
  }
};

module.exports = signinstep2;
