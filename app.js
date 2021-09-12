// const express = require("express");
import express from "express";

const app = express();
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`server's running on port ${PORT}`);
});
