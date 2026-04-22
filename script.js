let editingIndex = -1
let words = JSON.parse(localStorage.getItem("words")) || []

let mediaRecorder
let audioChunks = []
let audioBase64 = ""

let currentPracticeIndex = 0

let currentExamIndex = 0
let examMode = "en-es"

let totalCorrect = 0
let totalWrong = 0
let streak = 0

let pronunciationCorrect = 0
let pronunciationWrong = 0

let examQuestion = 0
let examTotal = 0

showWords()

// =============================
// FUNCION GLOBAL LIMPIEZA TEXTO (ÚNICA)
// =============================
function limpiarTexto(texto){
return texto
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.replace(/[.,!?;:¿¡]/g,"")
.trim()
}

// =============================
// NAVEGACION
// =============================
function showAdd(){
document.getElementById("addSection").style.display="block"
document.getElementById("listSection").style.display="none"
document.getElementById("practiceArea").style.display="none"
document.getElementById("examArea").style.display="none"
}

function showList(){
document.getElementById("addSection").style.display="none"
document.getElementById("listSection").style.display="block"
document.getElementById("practiceArea").style.display="none"
document.getElementById("examArea").style.display="none"
showWords()
}

// =============================
function clearForm(){
document.getElementById("phrase").value=""
document.getElementById("translation").value=""
document.getElementById("pronunciation").value=""
document.getElementById("exampleEn").value=""
document.getElementById("exampleEs").value=""
document.getElementById("notes").value=""
document.getElementById("audioPlayback").src=""
audioBase64=""
}

// =============================
async function startRecording(){
try{
let stream = await navigator.mediaDevices.getUserMedia({audio:true})
mediaRecorder = new MediaRecorder(stream)
audioChunks = []

mediaRecorder.ondataavailable = e=> audioChunks.push(e.data)

mediaRecorder.onstop = ()=>{
let blob = new Blob(audioChunks,{type:"audio/webm"})
let reader = new FileReader()

reader.readAsDataURL(blob)
reader.onloadend = ()=>{
audioBase64 = reader.result
document.getElementById("audioPlayback").src = audioBase64
}

stream.getTracks().forEach(t=>t.stop())
}

mediaRecorder.start()

}catch{
alert("No se pudo acceder al micrófono")
}
}

function stopRecording(){
if(mediaRecorder && mediaRecorder.state !== "inactive"){
mediaRecorder.stop()
}
}

// =============================
function addWord(){

let word = {
phrase: document.getElementById("phrase").value,
translation: document.getElementById("translation").value,
pronunciation: document.getElementById("pronunciation").value,
exampleEn: document.getElementById("exampleEn").value,
exampleEs: document.getElementById("exampleEs").value,
notes: document.getElementById("notes").value,
audio: audioBase64,
correct:0,
wrong:0
}

if(word.phrase==="") return

if(editingIndex === -1){
words.push(word)
}else{
words[editingIndex] = word
editingIndex = -1
}

localStorage.setItem("words", JSON.stringify(words))
showWords()
clearForm()
}

// =============================
function showWords(){

let list = document.getElementById("list")
if(!list) return

list.innerHTML=""

words.forEach((w,i)=>{
list.innerHTML += `
<div class="card">
<h3>${w.phrase}</h3>
<p><b>Traducción:</b> ${w.translation}</p>
<p><b>Pronunciación:</b> ${w.pronunciation}</p>

<p>${w.exampleEn || ""}</p>
<p>${w.exampleEs || ""}</p>

${w.audio ? `<audio controls src="${w.audio}"></audio>` : ""}

<button onclick="deleteWord(${i})">Eliminar</button>
<button onclick="editWord(${i})">✏️ Editar</button>
</div>`
})
}

// =============================
function deleteWord(i){
words.splice(i,1)
localStorage.setItem("words", JSON.stringify(words))
showWords()
}

function editWord(i){

let w = words[i]

document.getElementById("phrase").value = w.phrase
document.getElementById("translation").value = w.translation
document.getElementById("pronunciation").value = w.pronunciation
document.getElementById("exampleEn").value = w.exampleEn
document.getElementById("exampleEs").value = w.exampleEs
document.getElementById("notes").value = w.notes
document.getElementById("audioPlayback").src = w.audio || ""

audioBase64 = w.audio || ""
editingIndex = i

showAdd()
}

// =============================
function searchWord(){

let search = document.getElementById("search").value.toLowerCase()
let cards = document.querySelectorAll(".card")

cards.forEach(card=>{
card.style.display = card.innerText.toLowerCase().includes(search) ? "block":"none"
})
}

// =============================
// PRACTICA
// =============================
function startPractice(){

if(words.length === 0){
alert("No hay palabras")
return
}

document.getElementById("addSection").style.display="none"
document.getElementById("listSection").style.display="none"
document.getElementById("examArea").style.display="none"
document.getElementById("practiceArea").style.display="block"

nextWord()
}

function nextWord(){

let w = words[Math.floor(Math.random()*words.length)]
currentPracticeIndex = words.indexOf(w)

document.getElementById("practiceWord").innerText = w.phrase
document.getElementById("practiceTranslation").innerText = "Traducción: "+w.translation
document.getElementById("practiceExampleEn").innerText = w.exampleEn || ""
document.getElementById("practiceExampleEs").innerText = w.exampleEs || ""
document.getElementById("practiceNotes").innerText = w.notes ? "📝 "+w.notes : ""

let audio = document.getElementById("practiceAudio")
if(w.audio){
audio.src = w.audio
audio.style.display="block"
}else{
audio.style.display="none"
}

document.getElementById("answer").style.display="none"
}

function showAnswer(){
document.getElementById("answer").style.display="block"
}

// =============================
function speakWord(){
let s = new SpeechSynthesisUtterance(words[currentPracticeIndex].phrase)
s.lang="en-US"
speechSynthesis.speak(s)
}

function speakExample(){
let ex = words[currentPracticeIndex].exampleEn
if(!ex) return
let s = new SpeechSynthesisUtterance(ex)
s.lang="en-US"
speechSynthesis.speak(s)
}

// =============================
// EXAMEN
// =============================
function startExam(){

if(words.length===0){
alert("No hay palabras")
return
}

document.getElementById("addSection").style.display="none"
document.getElementById("listSection").style.display="none"
document.getElementById("practiceArea").style.display="none"
document.getElementById("examArea").style.display="block"

examQuestion=0
examTotal=words.length
totalCorrect=0
totalWrong=0
streak=0

nextExam()
}

function nextExam(){

if(examQuestion>=examTotal){
document.getElementById("examWord").innerText="Examen terminado"
document.getElementById("examResult").innerHTML=`<button onclick="startExam()">Reiniciar</button>`
return
}

examQuestion++

let w = words[Math.floor(Math.random()*words.length)]
currentExamIndex = words.indexOf(w)

if(Math.random()<0.5){
examMode="en-es"
document.getElementById("examWord").innerText = w.phrase
}else{
examMode="es-en"
let t = w.translation.split(",")
document.getElementById("examWord").innerText = t[Math.floor(Math.random()*t.length)].trim()
}

document.getElementById("examAnswer").value=""
document.getElementById("examResult").innerHTML=""
document.getElementById("pronunciationResult").innerHTML=""
document.getElementById("stats").innerHTML=""
}

// =============================
// VALIDACION CORREGIDA
// =============================
function checkExam(){

let user = limpiarTexto(document.getElementById("examAnswer").value)
let w = words[currentExamIndex]

let correct=false

if(examMode==="en-es"){
correct = w.translation.split(",").some(a=>limpiarTexto(a)===user)
}else{
correct = limpiarTexto(w.phrase)===user
}

if(correct){ totalCorrect++; streak++ }
else{ totalWrong++; streak=0 }

let total = totalCorrect+totalWrong
let acc = total>0 ? Math.round((totalCorrect/total)*100):0

document.getElementById("examResult").innerHTML=`
${correct?"✅ Correcto":"❌ Incorrecto"}<br>
📊 ${totalCorrect} | ❌ ${totalWrong} | 🎯 ${acc}% | 🔥 ${streak}
`
}

// =============================
// VOZ
// =============================
function startPronunciationTest(){

let rec = new (window.SpeechRecognition||window.webkitSpeechRecognition)()
rec.lang="en-US"
rec.start()

rec.onresult = e=>{
let spoken = limpiarTexto(e.results[0][0].transcript)
let correct = limpiarTexto(words[currentExamIndex].phrase)

if(spoken===correct){
pronunciationCorrect++
document.getElementById("pronunciationResult").innerText="🎤 Correcto"
}else{
pronunciationWrong++
document.getElementById("pronunciationResult").innerText="⚠️ Incorrecto"
}

let total = pronunciationCorrect+pronunciationWrong
let acc = Math.round((pronunciationCorrect/total)*100)

document.getElementById("stats").innerText=
`🎤 ${pronunciationCorrect} | ⚠️ ${pronunciationWrong} | ${acc}%`
}
}

// =============================
// PWA
// =============================
if("serviceWorker" in navigator){
navigator.serviceWorker.register("service-worker.js")
}

let deferredPrompt

window.addEventListener("beforeinstallprompt", e=>{
e.preventDefault()
deferredPrompt=e
document.getElementById("installBtn").style.display="block"
})

document.getElementById("installBtn")?.addEventListener("click",()=>{
if(deferredPrompt){
deferredPrompt.prompt()
deferredPrompt=null
}
})
