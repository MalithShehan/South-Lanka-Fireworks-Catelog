import { jsPDF } from "jspdf"
var font = 'undefined';
var callAddFont = function () {
this.addFileToVFS('poppins-normal.ttf', font);
this.addFont('poppins-normal.ttf', 'poppins', 'normal');
};
jsPDF.API.events.push(['addFonts', callAddFont])
