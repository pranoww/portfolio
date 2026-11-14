// Redraws the live contact form (labels, typed values, button) onto a canvas so the 3D paper carries exactly what was written
import * as THREE from "three";

const cardRadius = 18;
const fieldRadius = 10;
const fieldPadding = 16;
const textareaLineHeight = 24;

function wrapTextLines(context, text, maxWidth) {
  const lineList = [];
  let currentLine = "";
  for (const word of text.split(/\s+/)) {
    const candidateLine = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(candidateLine).width > maxWidth && currentLine) {
      lineList.push(currentLine);
      currentLine = word;
    } else currentLine = candidateLine;
  }
  if (currentLine) lineList.push(currentLine);
  return lineList;
}

function fillRoundedRectangle(context, { x, y, width, height }, radius, fillColor) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fillStyle = fillColor;
  context.fill();
}

export function drawFormSnapshotTexture(formElement, textureScale, maxAnisotropy) {
  const formRectangle = formElement.getBoundingClientRect();
  const snapshotCanvas = document.createElement("canvas");
  snapshotCanvas.width = Math.round(formRectangle.width * textureScale);
  snapshotCanvas.height = Math.round(formRectangle.height * textureScale);
  const context = snapshotCanvas.getContext("2d");
  context.scale(textureScale, textureScale);
  context.textBaseline = "middle";

  const boxInsideForm = element => {
    const rectangle = element.getBoundingClientRect();
    return { x: rectangle.left - formRectangle.left, y: rectangle.top - formRectangle.top, width: rectangle.width, height: rectangle.height };
  };

  fillRoundedRectangle(context, { x: 0, y: 0, width: formRectangle.width, height: formRectangle.height }, cardRadius, getComputedStyle(formElement).backgroundColor);

  for (const label of formElement.querySelectorAll("label")) {
    const box = boxInsideForm(label);
    const labelStyle = getComputedStyle(label);
    context.font = labelStyle.font;
    context.fillStyle = labelStyle.color;
    context.fillText(label.textContent, box.x, box.y + box.height / 2);
  }

  for (const field of formElement.querySelectorAll("input:not([aria-hidden='true']), textarea")) {
    const box = boxInsideForm(field);
    const fieldStyle = getComputedStyle(field);
    fillRoundedRectangle(context, box, fieldRadius, fieldStyle.borderColor);
    fillRoundedRectangle(context, { x: box.x + 1, y: box.y + 1, width: box.width - 2, height: box.height - 2 }, fieldRadius - 1, fieldStyle.backgroundColor);
    context.font = fieldStyle.font;
    context.fillStyle = fieldStyle.color;
    if (field.tagName === "TEXTAREA") {
      wrapTextLines(context, field.value, box.width - fieldPadding * 2).forEach((line, lineIndex) => {
        const lineCentre = box.y + 12 + textareaLineHeight * (lineIndex + 0.5);
        if (lineCentre < box.y + box.height - 8) context.fillText(line, box.x + fieldPadding, lineCentre);
      });
    } else context.fillText(field.value, box.x + fieldPadding, box.y + box.height / 2);
  }

  const button = formElement.querySelector("button[type='submit']");
  const buttonBox = boxInsideForm(button);
  const buttonStyle = getComputedStyle(button);
  fillRoundedRectangle(context, buttonBox, buttonBox.height / 2, buttonStyle.backgroundColor);
  context.font = buttonStyle.font;
  context.fillStyle = buttonStyle.color;
  context.fillText(button.textContent, buttonBox.x + parseFloat(buttonStyle.paddingLeft), buttonBox.y + buttonBox.height / 2);
  const buttonDot = button.querySelector("span[aria-hidden='true']");
  if (buttonDot) {
    const dotBox = boxInsideForm(buttonDot);
    context.beginPath();
    context.arc(dotBox.x + dotBox.width / 2, dotBox.y + dotBox.height / 2, dotBox.width / 2, 0, Math.PI * 2);
    context.fillStyle = getComputedStyle(buttonDot).backgroundColor;
    context.fill();
  }

  const texture = new THREE.CanvasTexture(snapshotCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return { texture, formRectangle };
}

export function drawRoundedCornerMask(width, height) {
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = 256;
  maskCanvas.height = Math.round(256 * height / width);
  const context = maskCanvas.getContext("2d");
  context.fillStyle = "#000000";
  context.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
  fillRoundedRectangle(context, { x: 0, y: 0, width: maskCanvas.width, height: maskCanvas.height }, cardRadius * 256 / width, "#ffffff");
  return new THREE.CanvasTexture(maskCanvas);
}
