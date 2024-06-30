function openNav() {
  document.getElementById("mySidenav").style.width = "222px";
  document.getElementById("mySidenav").style.zIndex = "10";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}

document.addEventListener("click", (event) => {
  if (
    document.getElementById("nbtn").contains(event.target) ||
    document.getElementById("mySidenav").contains(event.target)
  ) {
    return;
  }
  document.getElementById("mySidenav").style.width = "0";
});

function myDropdown() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches(".sidenav span")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};
