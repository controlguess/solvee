async function solve() {
  const eq = document.getElementById("equation").value;

  const res = await fetch(`/api/ai?prompt=${encodeURIComponent(eq)}`);
  const data = await res.json();

  document.getElementById("result").innerText =
    data.result || data.error;
}

async function scanImage() {
  const file = document.getElementById("imageInput").files[0];
  if (!file) return;

  document.getElementById("result").innerText = "Scanning...";

  const result = await Tesseract.recognize(file, "eng");

  let text = result.data.text;

  text = text.replace(/[^0-9xXyYzZ+\-*/^().=]/g, "");

  document.getElementById("equation").value = text;

  document.getElementById("result").innerText =
    "Got " + text;
}
