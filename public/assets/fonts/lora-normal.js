import { jsPDF } from "jspdf"
var font = 'undefined';
var callAddFont = function () {
this.addFileToVFS('lora-normal.ttf', font);
this.addFont('lora-normal.ttf', 'lora', 'normal');
};
jsPDF.API.events.push(['addFonts', callAddFont])
