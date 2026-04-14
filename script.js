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
// LIMPIAR FORM
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
// GRABAR AUDIO
// =============================

async function startRecording(){

try{

let stream = await navigator.mediaDevices.getUserMedia({audio:true})

mediaRecorder = new MediaRecorder(stream)

audioChunks = []

mediaRecorder.ondataavailable = event =>{
audioChunks.push(event.data)
}

mediaRecorder.onstop = ()=>{

let audioBlob = new Blob(audioChunks,{type:"audio/webm"})

let reader = new FileReader()

reader.readAsDataURL(audioBlob)

reader.onloadend = function(){

audioBase64 = reader.result
document.getElementById("audioPlayback").src = audioBase64

}

stream.getTracks().forEach(track => track.stop())

}

mediaRecorder.start()

}catch(error){

alert("No se pudo acceder al micrófono")

}

}

function stopRecording(){

if(mediaRecorder && mediaRecorder.state !== "inactive"){
mediaRecorder.stop()
}

}

// =============================
// GUARDAR PALABRA
// =============================

function addWord(){

let phrase = document.getElementById("phrase").value
let translation = document.getElementById("translation").value
let pronunciation = document.getElementById("pronunciation").value
let exampleEn = document.getElementById("exampleEn").value
let exampleEs = document.getElementById("exampleEs").value
let notes = document.getElementById("notes").value

if(phrase==="") return

let word = {
phrase,
translation,
pronunciation,
exampleEn,
exampleEs,
notes,
audio: audioBase64,
correct:0,
wrong:0
}

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
// MOSTRAR LISTA
// =============================

function showWords(){

let list = document.getElementById("list")
if(!list) return

list.innerHTML=""

words.forEach((w,index)=>{

list.innerHTML += `

<div class="card">

<h3>${w.phrase}</h3>

<p><b>Traducción:</b> ${w.translation}</p>
<p><b>Pronunciación:</b> ${w.pronunciation}</p>

<p><b>Ejemplo:</b></p>
<p>${w.exampleEn || ""}</p>
<p>${w.exampleEs || ""}</p>

${w.audio ? `<audio controls src="${w.audio}"></audio>` : ""}

<br><br>

<button onclick="deleteWord(${index})">Eliminar</button>
<button onclick="editWord(${index})">✏️ Editar</button>

</div>

`

})

}

// =============================
// EDITAR / ELIMINAR
// =============================

function deleteWord(index){

words.splice(index,1)

localStorage.setItem("words", JSON.stringify(words))

showWords()

}

function editWord(index){

let w = words[index]

document.getElementById("phrase").value = w.phrase
document.getElementById("translation").value = w.translation
document.getElementById("pronunciation").value = w.pronunciation
document.getElementById("exampleEn").value = w.exampleEn
document.getElementById("exampleEs").value = w.exampleEs
document.getElementById("notes").value = w.notes

document.getElementById("audioPlayback").src = w.audio || ""

audioBase64 = w.audio || ""

editingIndex = index

showAdd()

}

// =============================
// BUSCAR
// =============================

function searchWord(){

let search = document.getElementById("search").value.toLowerCase()

let cards = document.querySelectorAll(".card")

cards.forEach(card=>{

let text = card.innerText.toLowerCase()

card.style.display = text.includes(search) ? "block" : "none"

})

}

// =============================
// PRACTICA
// =============================

function startPractice(){

if(words.length === 0){
alert("No hay palabras para practicar")
return
}

document.getElementById("addSection").style.display = "none"
document.getElementById("listSection").style.display = "none"
document.getElementById("examArea").style.display = "none"
document.getElementById("practiceArea").style.display = "block"

nextWord()

}

function nextWord(){

document.getElementById("practiceWord").style.opacity = 0

setTimeout(()=>{
document.getElementById("practiceWord").style.opacity = 1
},200)

let randomIndex = Math.floor(Math.random() * words.length)

currentPracticeIndex = randomIndex

let word = words[randomIndex]

document.getElementById("practiceWord").innerText = word.phrase

document.getElementById("practiceTranslation").innerText =
"Traducción: " + word.translation

document.getElementById("practiceExampleEn").innerText =
word.exampleEn || ""

document.getElementById("practiceExampleEs").innerText =
word.exampleEs || ""

let audioPlayer = document.getElementById("practiceAudio")

if(word.audio){
audioPlayer.src = word.audio
audioPlayer.style.display = "block"
}else{
audioPlayer.style.display = "none"
}

document.getElementById("answer").style.display = "none"

}

function showAnswer(){

document.getElementById("answer").style.display = "block"

let example = words[currentPracticeIndex].exampleEn

if(example && example.trim() !== ""){
document.getElementById("btnSpeakExample").style.display = "inline-block"
}else{
document.getElementById("btnSpeakExample").style.display = "none"
}

}

// 🔹 NUEVA FUNCION PARA GIRAR TARJETA

function flipCard(){

let card = document.getElementById("flashcard")

card.classList.toggle("flip")

}

// =============================
// PRONUNCIACION PRACTICA
// =============================

function speakWord(){

let word = words[currentPracticeIndex].phrase

let speech = new SpeechSynthesisUtterance(word)

speech.lang = "en-US"

speechSynthesis.cancel()
speechSynthesis.speak(speech)

}

function speakExample(){

let example = words[currentPracticeIndex].exampleEn

if(!example) return

let speech = new SpeechSynthesisUtterance(example)

speech.lang = "en-US"

speechSynthesis.cancel()
speechSynthesis.speak(speech)

}

// =============================
// PRONUNCIACION EXAMEN
// =============================

function startExamRecording(){

let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()

recognition.lang = "en-US"

recognition.start()

recognition.onresult = function(event){

let userSpeech = event.results[0][0].transcript

let word = words[currentExamIndex].phrase

// limpiar signos
function limpiarTexto(texto){

return texto
.toLowerCase()
.replace(/[.,!?;:¿¡]/g,"")
.trim()

}

let correcto = limpiarTexto(userSpeech) === limpiarTexto(word)

if(correcto){

pronunciationCorrect++

document.getElementById("pronunciationResult").innerHTML = "🎤 Pronunciación correcta"

}else{

pronunciationWrong++

document.getElementById("pronunciationResult").innerHTML = "⚠️ Pronunciación incorrecta"

}

let total = pronunciationCorrect + pronunciationWrong

let accuracy = Math.round((pronunciationCorrect/total)*100)

document.getElementById("stats").innerHTML = `
🎤 Pronunciación correcta: ${pronunciationCorrect} |
⚠️ Pronunciación incorrecta: ${pronunciationWrong} |
🎧 Precisión voz: ${accuracy}%
`

}

}

// =============================
// EXAMEN
// =============================

function startExam(){

if(words.length === 0){
alert("No hay palabras para examinar")
return
}

document.getElementById("addSection").style.display = "none"
document.getElementById("listSection").style.display = "none"
document.getElementById("practiceArea").style.display = "none"
document.getElementById("examArea").style.display = "block"

examQuestion = 0
examTotal = words.length

totalCorrect = 0
totalWrong = 0
streak = 0

nextExam()

}

function nextExam(){

if(examQuestion >= examTotal){

document.getElementById("examWord").innerText = "Examen terminado"

document.getElementById("examResult").innerHTML =
`<button onclick="startExam()">🔁 Reiniciar examen</button>`

return
}

examQuestion++

let randomIndex = Math.floor(Math.random() * words.length)

currentExamIndex = randomIndex

let word = words[randomIndex]

if(Math.random() < 0.5){

examMode = "en-es"
document.getElementById("examWord").innerText = word.phrase

}else{

examMode = "es-en"

let translations = word.translation.split(",")

let randomTranslation = translations[Math.floor(Math.random()*translations.length)]

document.getElementById("examWord").innerText = randomTranslation.trim()

}

document.getElementById("examCounter").innerText =
"Pregunta " + examQuestion + " de " + examTotal


// LIMPIAR CAMPOS AL CAMBIAR PREGUNTA

document.getElementById("examAnswer").value = ""

document.getElementById("examResult").innerHTML = ""

document.getElementById("pronunciationResult").innerHTML = ""

document.getElementById("stats").innerHTML = ""

}

// =============================
// VERIFICAR EXAMEN
// =============================

function limpiarTexto(texto){

return texto
.toLowerCase()
.replace(/[.,!?;:¿¡]/g,"")
.trim()

}

function checkExam(){

let userAnswer = document.getElementById("examAnswer").value.toLowerCase().trim()

let word = words[currentExamIndex]

let correct = false

if(examMode === "en-es"){

let correctAnswers = word.translation.toLowerCase().split(",")

correct = correctAnswers.some(ans => ans.trim() === userAnswer)

}else{

correct = userAnswer === word.phrase.toLowerCase()

}

if(correct){
word.correct++
totalCorrect++
streak++
}else{
word.wrong++
totalWrong++
streak = 0
}

let total = totalCorrect + totalWrong
let accuracy = total > 0 ? Math.round((totalCorrect/total)*100) : 0

document.getElementById("examResult").innerHTML = `
${correct ? "✅ Correcto" : "❌ Incorrecto"}<br><br>
📊 Correctas: ${totalCorrect} |
❌ Incorrectas: ${totalWrong} |
🎯 Precisión: ${accuracy}% |
🔥 Racha: ${streak}
`

localStorage.setItem("words", JSON.stringify(words))

}

// =============================
// PRUEBA DE PRONUNCIACION
// =============================

function startPronunciationTest(){

let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

if(!SpeechRecognition){
alert("Tu navegador no soporta reconocimiento de voz")
return
}

let recognition = new SpeechRecognition()

recognition.lang = "en-US"
recognition.interimResults = false

recognition.start()

recognition.onresult = function(event){

let spoken = event.results[0][0].transcript.toLowerCase().trim()

let correct = words[currentExamIndex].phrase.toLowerCase().trim()

let result = document.getElementById("pronunciationResult")

if(spoken === correct){

pronunciationCorrect++

result.innerHTML = "🎤 Pronunciación correcta"

}else{

pronunciationWrong++

result.innerHTML =
`⚠️ Dijiste: <b>${spoken}</b><br>
✔ Correcto: <b>${correct}</b>`

}

updatePronunciationStats()

}

recognition.onerror = function(){
alert("No se pudo reconocer la voz")
}

}

// =============================
// ESTADISTICAS DE VOZ
// =============================

function updatePronunciationStats(){

let total = pronunciationCorrect + pronunciationWrong

let accuracy = total > 0
? Math.round((pronunciationCorrect / total) * 100)
: 0

document.getElementById("stats").innerHTML =

`🎤 Pronunciación correcta: ${pronunciationCorrect}
 | ⚠️ Pronunciación incorrecta: ${pronunciationWrong}
 | 🎧 Precisión voz: ${accuracy}%`

} 

if("serviceWorker" in navigator){
    navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("PWA lista"))
    .catch(err => console.log("Error SW:", err))
}