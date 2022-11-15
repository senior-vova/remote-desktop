window.onload = () => {
  const input = document.getElementById("code");
  const code = localStorage.getItem("code");
  if (code) {
    input.value = code;
  }
  input.onchange = (e) => {
    localStorage.setItem("code", e.target.value);
  };
};

function startShare() {
  const code = document.getElementById("code").value;
  window.electron.ipcRenderer.startShare(code);
  document.getElementById("start").style.display = "none";
  document.getElementById("stop").style.display = "block";
}

function stopShare() {
  window.electron.ipcRenderer.stopShare();
  document.getElementById("stop").style.display = "none";
  document.getElementById("start").style.display = "block";
}
