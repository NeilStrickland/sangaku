try {
 if (window.loaded_scripts &&
     window.loaded_scripts.calendar &&
     Calendar.setup_all) {
  Calendar.setup_all();
 }
} catch(e) {}