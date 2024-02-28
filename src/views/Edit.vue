<template>
  <div class="page" id="page" @dragover.prevent @drop.prevent>
    <div class="topBar">
      <nav class="nav editor">
        <router-link to="/"
          ><img class="brand--icon" src="@/assets/icon.svg"
        /></router-link>

        <form @submit.prevent class="docTitle">
          <input
            @keyup="saveTitle"
            v-model="doc.title"
            type="text"
            class="input title"
            :placeholder="$t('docName')"
          />
        </form>
        <p class="lastEdited nav-item">
          {{ $t('lastEdited') }}: {{ lastEdited }}
        </p>
        <p v-if="!saveError" class="saved nav-item">
          {{ saved ? $t('saved') : $t('waiting') }}
        </p>

        <p v-if="saveError" class="saved error nav-item">Error Saving</p>

        <button class="nav-item" @click="print()">{{ $t('print') }}</button>
        <button class="nav-item" @click="generateDocx">Download as docx</button>
        <button class="nav-item delete" @click="deleteDoc">
          {{ $t('delete') }}
        </button>
      </nav>

      <div id="toolbar">
        <button class="ql-bold" @click="makeBold"></button>
        <button class="ql-italic" @click="makeItalic"></button>
        <button class="ql-strike" type="button" @click="makestrike"></button>

        <span class="ql-formats">
          <button type="button" class="ql-indent" value="+1" @click="IncreaseindentText"></button>
          <button type="button" class="ql-direction" value="rtl" @click="setDirection"></button>
        </span>
        <span class="ql-formats">
         
          <button type="button" class="ql-code-block" @click="set_black"></button>
          <button type="button" class="ql-script" value="sub" @click="set_subscript"></button>
          <button type="button" class="ql-script" value="super" @click="set_superscript"></button>
          <button type="button" class="ql-clean" @click="Clean"></button>
        </span>
        <span class="inline-block px-40 font-lemonada">
          <form>
            <div @drop="onFileChange">
              <label
                for="files"
                class="bg-[#4573e8ff] rounded-md text-gray-100 text-[11px] leading-[18px] px-[10px] py-2"
                >Upload Docx</label
              >
              <div v-if="uploading">
                <img src="@/assets/maze.gif" class="w-4 h-4" alt="icon" />
              </div>
              <input
                id="files"
                type="file"
                accept=".doc,.docx"
                @change="onFileChange"
                hidden
              />
            </div>
          </form>
        </span>
        <span class="inline-block px-40 font-lemonada">
          <form>
            <div @drop="onAudioUpload">
              <label
                for="audio"
                class="bg-[#4573e8ff] rounded-md text-gray-100 text-[11px] leading-[18px] px-[10px] py-2"
                >Upload Audio</label
              >
              <div v-if="uploading_audio">
                <img src="@/assets/maze.gif" class="w-4 h-4" alt="icon" />
              </div>
              <input
                id="audio"
                type="file"
                accept=".mp3,.wav"
                @change="onAudioUpload"
                hidden
              />
            </div>
          </form>
        </span>
      </div>
    </div>
    

    <div class="editor__app">
      <v-textarea
        class="editor__document"
        id="doc"
        ref="editor"
        label="TextArea"
        outlined
        contentEditable="true"
        hide-details="auto"
        auto-grow
        v-model="value"
        v-html="html"
        @input="updateHtml"
        
      ></v-textarea>
      <iframe src='http://pad.test.de/p/PAD_NAME?showChat=false&showLineNumbers=false' width=600 height=400></iframe>

      <div ref="specifiedContent" :style="specifiedContentStyle">
        {{ specifiedText }}
      </div>
      <div
        style="position: fixed; overflow: auto; max-height: 82vh; right: 50px"
      >
        <div class="overflow-auto relative">
          <div
            class="review grid content-between font-lemonada overflow-y-auto"
            id="nav"
          >
            <div>
              <div
                class="flex justify-between text-gray-100 text-[9px] leading-[14px]"
              >
                <button class="w-20 h-6 rounded-xl bg-[#1749eeff]">
                  Review
                </button>
                <button class="w-20 h-6 rounded-xl bg-[#f22128ff]">
                  Draft
                </button>
                <button class="w-20 h-6 rounded-xl bg-[#f22128ff]">
                  Summarise
                </button>
              </div>

              <div class="grid gap-y-2 pt-[22px]">
                <div
                  class="grid grid-flow-col justify-start gap-x-[10px] bg-[#f5f3efff] h-16 w-full pl-[14px] py-2"
                >
                  <img :src="searchImg" class="w-[19px] h-[18px]" />
                  <textarea
                    v-model="searchInput"
                    id="searchInput"
                    placeholder='Search in Review "'
                    class="bg-[#f5f3efff] w-[162px] h-full text-[9px] outline-none resize-none overflow-hidden"
                  >
                  </textarea>
                </div>
                <div class="flex justify-end">
                  <button
                    class="w-12 h-6 text-gray-100 bg-[#4573e8ff] rounded-xl text-[9px]"
                    @click="searchItem()"
                  >
                    Search
                  </button>
                </div>
              </div>

              <div class="grid gap-y-2 pt-[26px]">
                <div class="grid gap-y-[10px] text-[11px]">
                  <select
                    v-model="receivingoption"
                    class="px-2 w-full h-[28px] rounded-[3px] border-[#9095a1ff] border outline-none"
                  >
                    <option value="Receive">I'm receiving this Document</option>
                    <option value="Send">I'm sending this Document</option>
                  </select>
                  <select
                    v-model="selectedOption"
                    @change="handleChange"
                    class="px-2 w-full h-[28px] rounded-[3px] border-[#9095a1ff] border outline-none"
                  >
                    <option value="Points_To_Negotiate">
                      Points_To_Negotiate
                    </option>
                    <option value="Missing_Clauses">Missing_Clauses</option>
                    <option value="Complex_Language">Complex_Language</option>
                    <option value="Ambiguities">Ambiguities</option>
                    <option value="Undefined_Terms">Undefined_Terms</option>
                    <option value="Inconsistencies">Inconsistencies</option>
                    <option value="Conflicting_Terms">Conflicting_Terms</option>
                    <option value="Non_standard_Clause">
                      Non_standard_Clause
                    </option>
                  </select>
                </div>
                <div class="flex justify-end">
                  <div v-if="awesome">
                    <img src="@/assets/maze.gif" class="w-8 h-8" alt="icon" />
                  </div>
                  <button
                    class="w-12 h-6 text-gray-100 bg-[#4573e8ff] rounded-xl text-[9px]"
                    v-on:click="submitFile()"
                  >
                    Analyse
                  </button>
                </div>
              </div>

              <div class="grid gap-y-[6px] mt-[20px]">
                <div
                  v-for="(item, index) in reply.undefined_term"
                  variant="success"
                  :key="index"
                  id="answer"
                  class="b-style relative grid py-2 border rounded z-40"
                >
                  <p
                    class="pt-[6px] pb-4 px-5 text-[11px] leading-[12px]"
                    @click="clickTerm(item)"
                  >
                    {{ item }}
                  </p>
                  <div v-if="writing">
                    <img
                      src="@/assets/maze.gif"
                      class="absolute w-4 h-4"
                      alt="icon"
                    />
                  </div>
                  <div>
                    <img
                      src="@/assets/close.png"
                      class="absolute w-3 h-3 right-1 top-1"
                      v-on:click="close_tile(index)"
                      alt="icon"
                    />
                  </div>
                  <button
                    v-if="Missing_Undefiend"
                    class="z-50 w-12 h-4 text-gray-100 bg-[#4573e8ff] rounded-xl text-[9px] absolute right-1 bottom-1"
                    v-on:click="writeforme(item, index)"
                  >
                    Write It
                  </button>
                  <button
                    v-if="Complex"
                    class="z-50 w-12 h-4 text-gray-100 bg-[#4573e8ff] rounded-xl text-[9px] absolute right-1 bottom-1"
                    v-on:click="Replace(item, index)"
                  >
                    Replace
                  </button>
                </div>
              </div>
            </div>
            <div v-if="isDialogOpen" class="fixed bottom-20 right-20 grid opacity-100 z-[100]">
              <div class="dialog-overlay right-3 bottom-0 w-[405px]">
                <div class="w-full dialog bg-[#3659e2ff] rounded-[4px] text-white px-8 py-4 text-[14px]">
                  <div class="flex">
                    <div class="text-center mr-10">
                      <img :src="Amelia" class="w-12 h-[60px]" />
                      <h3>Amelia</h3>
                    </div>
                    <h2 class="self-center">Let's Discuss This Document</h2>
                    <button class="absolute top-3 right-3 bg-white text-gray-900 rounded-[4px]">
                      <img :src="Expand" class="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div class="chat-history w-full h-[600px] bg-white rounded-[4px] border border-gay-200 px-8 py-4 mb-1 text-[11px] ">
                  <div class="grid  dialog ">
                    <p v-for="(item, index) in chatHistory" :key="index" class="bg-gray-200 w-fit p-3 rounded-[8px] m-3" :class="index%2===0? 'justify-self-start text-left' : 'justify-self-end text-right'">
                      {{item}}
                      <div v-if="quering">
                         <img src="@/assets/maze.gif" class="w-8 h-8" alt="icon" />
                      </div>
                    </p>
                  </div>
                </div>
                
                <div class="w-full text-[12px] relative">
                  <input class="w-full dialog rounded-[4px] border border-gay-900 px-8 py-4" placeholder="Ask a question or give an instruction..." @keyup.enter="handleEnterKey" />
                </div>
              </div>

              <button class="w-6 h-6 bg-[#3659e2ff] justify-self-end rounded-[4px] text-white" @click="closeDialog">X</button>
            </div>

            <div
              class="flex justify-end gap-x-3 text-[9px] leading-[14px] text-gray-100 pt-10"
            >
              <button class="py-1 px-3 rounded-xl bg-[#4573e8ff]" @click="openDialog">
                Discuss
              </button>
              <button class="py-1 px-3 rounded-xl bg-[#4573e8ff]">
                Research
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>

    <div v-if="sharingModal" class="modal_container">
      <div class="modal">
        <h3>{{ $t('sharing') }}</h3>
        <div class="share_link">
          <p>{{ $t('link') }}:</p>
          <input
            id="sharedLink"
            @click="copyLink"
            type="text"
            v-model="shareLink"
            readonly
          />
        </div>

        <p>{{ $t('linkDesc') }}</p>
        <button @click="sharingModal = false" class="btn">
          {{ $t('ok') }}
        </button>
      </div>
      <div class="modal_container" @click="sharingModal = false"></div>
    </div>

    <div v-if="!loaded" class="loading--fullscreen">
      <div class="sk-cube-grid">
        <div class="sk-cube sk-cube1"></div>
        <div class="sk-cube sk-cube2"></div>
        <div class="sk-cube sk-cube3"></div>
        <div class="sk-cube sk-cube4"></div>
        <div class="sk-cube sk-cube5"></div>
        <div class="sk-cube sk-cube6"></div>
        <div class="sk-cube sk-cube7"></div>
        <div class="sk-cube sk-cube8"></div>
        <div class="sk-cube sk-cube9"></div>
      </div>
      <img src="@/assets/wordmark.svg" alt="" />
    </div>
  </div>
</template>

<script>
import Quill from 'quill/dist/quill.min.js'
import JSONC from '../../jsonc.min'
import 'quill/dist/quill.core.js'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import axios from 'axios'
import searchImg from '../assets/searchicon.png'
import * as docx from 'docx-preview'
import HtmlDocx from 'html-docx-js/dist/html-docx'
import Amelia from '../assets/amelia.png';
import Expand from '../assets/expand.png';
function bytes(s) {
  return ~-encodeURI(s).split(/%..|./).length
}
function jsonSize(s) {
  return bytes(JSON.stringify(s))
}
let editor
let timeout = null
export default {
  name: 'Editor',
  head: {
    title: {
      inner: 'Legal Assistant',
      complement: 'Edit'
    },
    link: [
      {
        rel: 'canonical',
        href: '',
        id: 'canonical'
      }
    ]
  },
  components: {},
  el: '#page',
  data() {
    return {
      doc: {},
      saved: true,
      saveError: false,
      sharingModal: false,
      shareLink: '',
      error: false,
      loaded: false,
      highlightChar: 'e',
      highlightedIndex: -1,
      trace: this.$perf.trace('docLoad'),
      awesome: false,
      uploading:false,
      Missing_Undefiend: false,
      Complex:false,
      reply: {
        undefined_term: [],
        items: []
      },
      searchText: '',
      selectedOption: '',
      receivingoption: '',
      Non_standard_Clause: [],
      Inconsistencies: [],
      Ambiguities: [],
      Complex_Language: [],
      Missing_Clauses: [],
      Points_To_Negotiate: [],
      writing: false,
      pageContent: document.documentElement.innerHTML,
      searchImg: searchImg,
      currentIndex: -1, // Keep track of current index of the matched sections
      matches: [], // Will be filled with matched sections
      previous: '',
      written: false,
      html: '',
      value:'',
      specifiedText: '',
      specifiedContentStyle: '', // Store the computed style
      selectedFont: "",
      right_left:true,
      conflict_term:true,
      isDialogOpen:false,
      chatHistory: ['Hello How can I help you?'],
      Amelia: Amelia,
      Expand: Expand,
      quering:false,
      uploading_audio:false

    }
  },
  created() {
    this.trace.start()
  },
  watch: {
    searchInput() {
      this.currentIndex = -1
    }
  },
  computed: {
    user() {
      return this.$store.getters.user
    },
    lastEdited() {
      return this.$moment.unix(this.doc.date).fromNow()
    }
  },

  methods: {
    makeBold(){
      document.execCommand('bold',false,null);
      this.updateValue();
    },
    makeItalic(){
      document.execCommand('italic', false, null);
      this.updateValue();
    },
    makestrike(){
      document.execCommand('strikeThrough', false, null);
      this.updateValue();
    },
    setFont() {
      const editor = this.$refs.editor;
      const font = this.selectedFont;
      document.execCommand("fontName", false, font);
      this.updateValue();
    },
    DecreaseindentText() {
      document.execCommand("indent", false, "-1");
      this.updateValue();
    },
    IncreaseindentText()
    {
      document.execCommand("indent", false, "+1");
      this.updateValue();
    },
    alignCenter() {
      const textarea = this.$refs.editor.$el.querySelector('.v-textarea__slot textarea');
      textarea.style.textAlign = 'center';
    },
    setDirection() {
      if(this.right_left==true){
        this.right_left=false;
      }
      else{
        this.right_left=true;
      }
      document.execCommand("styleWithCSS", false, true);
      if(this.right_left==true){
        document.execCommand("justifyRight", false, null);
      }
      else{
        document.execCommand("justifyLeft", false, null);
      }
      
      this.updateValue();
    },
    insertOrderedList(){
      document.execCommand("insertOrderedList", false, null);
      this.updateValue();
    },
    insertUnorderedList(){
      document.execCommand("insertUnorderedList", false, null);
      this.updateValue();
    },
    set_black(){
      document.execCommand("backColor", false, "black");
      document.execCommand("foreColor", false, "white");
      this.updateValue();
    },
    set_subscript(){
      document.execCommand("subscript", false, null); 
      this.updateValue();
    },
    set_superscript(){
      document.execCommand("superscript", false, null); 
      this.updateValue();
    },
    Clean(){
      document.execCommand("removeFormat", false, null);
      this.updateValue();
    },
    updateFont(event) {
      const fontValue = event.target.value;
      const selectionStart = this.$refs.editor.selectionStart;
      const selectionEnd = this.$refs.editor.selectionEnd;
      const selectedText = this.value.substring(selectionStart, selectionEnd);
      const prefix = this.value.substring(0, selectionStart);
      const suffix = this.value.substring(selectionEnd);
      const outputText =
        prefix +
        '<span style="font-family: ' +
        fontValue +
        ';">' +
        selectedText +
        "</span>" +
        suffix;
      this.value = outputText;
    },
    updateValue() {
      this.value = this.$refs.editor.$el.innerHTML;
    },
    updateHtml(){
      this.html = this.value;
    },
    openDialog(){
      this.isDialogOpen = true;
    },
    closeDialog() {
      this.isDialogOpen = false;
    },
    findAllMatches(text, query) {
      text = text.toUpperCase()
      query = query.toUpperCase()
      let matches = []
      let i = 0
      while ((i = text.indexOf(query, i)) !== -1) {
        matches.push(i)
        i += query.length
      }
      return matches
    },
    highlightCurrentMatch(editor, searchTerm) {
      this.matches = this.findAllMatches(editor.innerHTML, searchTerm)
      let start = this.matches[this.currentIndex]
      let end = start + searchTerm.length
      editor.innerHTML =
        editor.innerHTML.substring(0, start) +
        '<span class="highlight">' +
        editor.innerHTML.substring(start, end) +
        '</span>' +
        editor.innerHTML.substring(end)
    },
    ReplaceCurrentMatch(editor, searchTerm, replaceTerm) {
      this.matches = this.findAllMatches(editor.innerHTML, searchTerm)
        let start = this.matches[0]
        if(this.matches[0]){
          let end = start + searchTerm.length;
           '<span class="highlight">'
          editor.innerHTML =editor.innerHTML.substring(0, start) +replaceTerm+editor.innerHTML.substring(end);
          }
    },
    UnhighlightCurrentMatch(editor, searchTerm) {
      let start = this.matches[this.currentIndex]
      let end = start + searchTerm.length
      editor.innerHTML =
        editor.innerHTML.substring(0, start) +
        '<span class="Unhighlight">' +
        editor.innerHTML.substring(start, end) +
        '</span>' +
        editor.innerHTML.substring(end)
    },
    removeHighlight(editor) {
      let highlight = editor.querySelector('.highlight')
      if (highlight) {
        highlight.outerHTML = highlight.innerHTML
      }
    },
    searchItem() {
      var searchTerm = document.getElementById('searchInput').value
      if (searchTerm != '') {
        var items = document.querySelectorAll('.b-style') // get all the item elements
        items.forEach(function (item) {
          if (item.outerText.toUpperCase().includes(searchTerm.toUpperCase())) {
            // check for match
            item.style = 'background-color: Yellow; color:black'
            item.classList.add('selected') // add 'selected' class to the matched item element
          } else {
            item.style = 'background-color: White; color:black'
            item.classList.remove('selected') // remove 'selected' class from non-matching item elements
          }
        })
        let editor = this.$refs.editor
        this.matches = this.findAllMatches(editor.innerHTML, searchTerm)

        if (this.matches.length > 0) {
          if (searchTerm != this.previous) {
            this.currentIndex = -1
          }
          this.removeHighlight(editor)
          this.currentIndex = (this.currentIndex + 1) % this.matches.length

          this.highlightCurrentMatch(editor, searchTerm)
          this.previous = searchTerm
          const firstMatch = editor.querySelector('.highlight')

          firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    },
    async handleEnterKey(event){
      const value = event.target.value;
      event.target.value=""
      this.chatHistory.push(value);
      this.quering=true;
      await axios
        .post(
          `http://13.210.182.133:8000/query`,
          { data: value }
        )
        .then((response) => {
          let answer = response.data.response;
          this.chatHistory.push(answer);
          this.quering=false;
        })
        .catch((error) => {})
    },
    async generateDocx() {
      const html = this.$refs.editor.innerHTML
      const options = {
        output: 'blob',
        returnJsZipFile: false
      }
      const blob = await HtmlDocx.asBlob(html)
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = 'document.docx' // change the filename if needed
      link.click()
    },
    close_tile(index) {
      this.reply.undefined_term.splice(index, 1)
    },
    Findmatch_highlight(editor,quotedString){
      let first_end=true;
      this.matches = this.findAllMatches(editor.innerHTML, quotedString)
      while(this.matches.length==0){
        const words=quotedString.split(" ");
        if(first_end){
          words.shift();
          first_end=false;
        }
        else{
          words.pop();
          first_end=true;
        }
        quotedString=words.join(" ");
        this.matches = this.findAllMatches(editor.innerHTML, quotedString)
        if (quotedString != this.previous) {
          this.currentIndex = -1
        }
      } 
      if (this.matches.length > 0) {
          this.removeHighlight(editor)
          this.currentIndex = (this.currentIndex + 1) % this.matches.length
          this.highlightCurrentMatch(editor, quotedString)
          const firstMatch = editor.querySelector('.highlight')
          firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      this.previous = quotedString
    },
    clickTerm(item) {
      let regex = /"([^"]*)"/
      let quotedString = ''
      quotedString = item.match(regex)[1]
      const editor = this.$refs.editor
      if (quotedString != '') {
         this.Findmatch_highlight(editor,quotedString);
      }
    },
    Replace(item) {
      let extractedStrings=[];
      let quotedString="";
      let replacestring="";
      const regex = /"([^"]*)"/g;
      let match;
      while ((match = regex.exec(item)) !== null) {
        extractedStrings.push(match[1]);
      }
      const length=extractedStrings.length
      quotedString=extractedStrings[0];
      replacestring=extractedStrings[length-1];  
      const editor = this.$refs.editor;
      if(quotedString!=""&&replacestring!="")
      {
       this.removeHighlight(editor)
       this.ReplaceCurrentMatch(editor,quotedString,replacestring);
       const firstMatch = editor.querySelector('.highlight')
       firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      
    },
    copyLink() {
      var copyText = document.getElementById('sharedLink')
      copyText.select()
      document.execCommand('copy')
    },
    async extractTextFromPdf(pdfUrl) {
      this.loading = true

      const pdf = await pdfjsLib.getDocument(pdfUrl).promise
      const maxPages = pdf.numPages
      let textContent = []

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageTextContent = content.items.map((item) => item.str).join('')
        textContent.push(pageTextContent)
      }
      return textContent.join('\n')
    },
    async parseDocx(buffer) {
      return new Promise((resolve) => {
        const doc = new Document(buffer)
        const packer = new Packer()
        const arrayBuffer = packer.toBuffer(doc)
        const blob = new Blob([arrayBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        })
        const url = URL.createObjectURL(blob)
        const xhr = new XMLHttpRequest()
        xhr.open('GET', url)
        xhr.responseType = 'blob'
        xhr.onload = async () => {
          const result = xhr.response
          resolve(result)
        }
        xhr.send()
      })
    },
    async onFileChange(event) {
      
      let file
      if (event.dataTransfer) {
        file = event.dataTransfer.files[0]
      } else if (event.target) {
        file = event.target.files[0]
      }
      if (!file) return
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      var options = { inWrapper: false, ignoreWidth: true, ignoreHeight: true }
      this.uploading=true;
      await docx
        .renderAsync(file, this.$refs.editor, null, options)
        
      const editorElement = this.$refs.editor
      const clone = editorElement.cloneNode(true)
      clone.querySelectorAll('style').forEach((style) => style.remove())
      const content = clone ? clone.textContent : ''
      await axios
        .post(
          `http://13.210.182.133:8000/ingest`,
          { data: content }
        )
        .then((response) => {
          let answer = response.data.response;
          this.uploading=false;
        })
        .catch((error) => {})
    },
    print() {
      if (this.$analytics) {
        this.$analytics.logEvent('print')
      }
      window.print()
    },  
    async onAudioUpload(event) {
      let file
      if (event.dataTransfer) {
        file = event.dataTransfer.files[0]
      } else if (event.target) {
        file = event.target.files[0]
      }
      if (!file) return
      const openai_key=require('../../config.json').OPENAI_API_KEY
      this.uploading_audio=true;
      const requst_file=new Blob([file],{type: 'audio/mp3'});
      const formData=new FormData();
      formData.append('file',requst_file,'test.mp3');
      formData.append('model', 'whisper-1');
      formData.append('language','en');
      const transcriptionResponse = await fetch(
        `https://api.openai.com/v1/audio/transcriptions`,
       {
          method: 'POST',
          headers: {
          Authorization: `Bearer ${openai_key}`,
          Accept: 'application/json'
          },
          body: formData
        }
      );
      const data = await transcriptionResponse.json();
      const transcribedText = data?.text || '';
      const editor=this.$refs.editor;
      editor.innerHTML+=transcribedText
      this.uploading_audio=false;
      

    },
    async writeforme(item, index) {
      const sel = document.getSelection()
      if (sel.anchorNode.data == 'Upload Docx') {
        alert('please put the cursor in editor')
        return
      }
      let regex = /"([^"]*)"/
      let quotedString = ''
      quotedString = item.match(regex)[1]
      if (quotedString != '') {
        this.writing = true
        const editorElement = this.$refs.editor
        const clone = editorElement.cloneNode(true)
        clone.querySelectorAll('style').forEach((style) => style.remove())
        const content = clone ? clone.textContent : ''
        await axios
          .post(
            `http://127.0.0.1:5000/Write_It_For_Me_${this.selectedOption}_${this.receivingoption}`,
            { data: content, written: quotedString }
          )
          .then((response) => {
            let answer = response.data.response
            if(!sel.anchorNode.data){
              const textNode=document.createTextNode(answer);
              sel.anchorNode.appendChild(textNode)
            }
            else{
              const newstring =sel.anchorNode.data.slice(0, sel.anchorOffset) +answer +sel.anchorNode.data.slice(sel.anchorOffset);
              sel.anchorNode.data = newstring;
            }
              
          })
          .catch((error) => {})
        this.writing = false
      }
    },

    async submitFile() {
      if (
        this.selectedOption == 'Missing_Clauses' ||
        this.selectedOption == 'Undefined_Terms'
      ) {
        this.Missing_Undefiend = true
      } else {
        this.Missing_Undefiend = false
      }
      if(this.selectedOption=='Complex_Language')
      {
       this.Complex=true; 
      }
      else {
        this.Complex = false
      }
      this.awesome = true
      const editorElement = this.$refs.editor
      const clone = editorElement.cloneNode(true)
      clone.querySelectorAll('style').forEach((style) => style.remove())
      const content = clone ? clone.textContent : ''
      var result = ''
      this.reply.undefined_term = []
      await axios
        .post(
          `http://127.0.0.1:5000/${this.selectedOption}_${this.receivingoption}`,
          { data: content }
        )
        .then((response) => {
          let answer = response.data.response;
          let current_item = ''
          for (let line of answer.split('\n')) {
            if (!isNaN(parseInt(line[0]))) {
              if (current_item !== ''&&!isNaN(parseInt(current_item[0]))) {
                if(!current_item.trim().includes("not complex")&&!current_item.trim().includes("None")){
                  this.reply.undefined_term.push(current_item.trim())
                }   
              }
              current_item = line
            } else {
              current_item += '\n' + line
            }
          }
          if(current_item.trim() !=='' && !isNaN(parseInt(current_item()[0]))){
            if(!current_item.trim().includes("not complex")&&!current_item.trim().includes("None")){
              this.reply.undefined_term.push(current_item.trim())
            }
            
          }
          this.reply.items = []
          let items = answer.match(/"[^"]*"/g)
          items = items.map((item) => item.replace(/"/g, ''))
          this.reply.items = items
        })
        .catch((error) => {})
      this.awesome = false
    },

    deleteDoc() {
      this.$swal({
        title: 'Are you sure?',
        text: 'Once deleted, you will not be able to recover this file!',
        icon: 'warning',
        buttons: true,
        dangerMode: true
      }).then((willDelete) => {
        if (willDelete) {
          fetch(
            `${this.$store.getters.api}/api/v1/documents/${this.$route.params.user}/${this.$route.params.docId}`,
            {
              method: 'delete',
              headers: {
                Authorization:
                  'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY3YmFiYWFiYTEwNWFkZDZiM2ZiYjlmZjNmZjVmZTNkY2E0Y2VkYTEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiTW9vbiBHYXRlcyIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQWNIVHRmc0RJVmV2OEljcVFSMU50dkhQcERjMDEwRnlmWTVXNkJBODJOMT1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9ncmFwaGl0ZS04OGU0MSIsImF1ZCI6ImdyYXBoaXRlLTg4ZTQxIiwiYXV0aF90aW1lIjoxNjg2OTY3NDE5LCJ1c2VyX2lkIjoialFSODZCUHB1MWRGSzVWRTFkRkFaNEltNWxNMiIsInN1YiI6ImpRUjg2QlBwdTFkRks1VkUxZEZBWjRJbTVsTTIiLCJpYXQiOjE2ODY5NjgzNTQsImV4cCI6MTY4Njk3MTk1NCwiZW1haWwiOiJtb29uZ2F0ZXM1MDAwQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTEwNzk3NTE1MTY2NjYxNjQzMzI5Il0sImVtYWlsIjpbIm1vb25nYXRlczUwMDBAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.ByIRebBsSmsgZEULHnPnh0oLXFMQqp53-1s93OY2k7RlK2OdMPjbt9izLYySAktbb_53iX4QYb4wSw_qwX4AA-kCEX9rS2h3s6FD832oF3MdhLC17UJXGPH3QLQZipn6c4B-_sY9VYzsnHz2E7RBYNhao3X7fcUHmOLOR0YjY0KPShaLYYva_OnZcK7PyIWdoAE-vJcNtDYNsxWZJCzoo6Uws76WbaO5D2ZJnBXkZR6sm_R2Bc13pFb4DI5oA9fPdxxM9L9xOo5uYXRYyP7b3mSzBFIEmeyZWoCrIAc4P9NWbFtqOTDAnJMkH37oe7LzV3IJSpAmVBQHsML8LgPTQw',
                'content-type': 'application/json'
              },
              body: JSON.stringify({
                deleteDoc: true,
                time: this.$moment().unix()
              })
            }
          )
            .then((res) => res.json())
            .then((res) => {
              if (res.success) {
                this.$router.push('/')
                if (this.$analytics) {
                  this.$analytics.logEvent('deletedDoc')
                }
              }
            })
        }
      })
    },
    share() {
      this.shareLink = ``
      this.sharingModal = true
      let body = { shared: true, time: this.$moment().unix() }
      fetch(
        `${this.$store.getters.api}/api/v1/documents/${this.$route.params.user}/${this.$route.params.docId}`,
        {
          method: 'post',
          headers: {
            Authorization:
              'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY3YmFiYWFiYTEwNWFkZDZiM2ZiYjlmZjNmZjVmZTNkY2E0Y2VkYTEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiTW9vbiBHYXRlcyIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQWNIVHRmc0RJVmV2OEljcVFSMU50dkhQcERjMDEwRnlmWTVXNkJBODJOMT1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9ncmFwaGl0ZS04OGU0MSIsImF1ZCI6ImdyYXBoaXRlLTg4ZTQxIiwiYXV0aF90aW1lIjoxNjg2OTY3NDE5LCJ1c2VyX2lkIjoialFSODZCUHB1MWRGSzVWRTFkRkFaNEltNWxNMiIsInN1YiI6ImpRUjg2QlBwdTFkRks1VkUxZEZBWjRJbTVsTTIiLCJpYXQiOjE2ODY5NjgzNTQsImV4cCI6MTY4Njk3MTk1NCwiZW1haWwiOiJtb29uZ2F0ZXM1MDAwQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTEwNzk3NTE1MTY2NjYxNjQzMzI5Il0sImVtYWlsIjpbIm1vb25nYXRlczUwMDBAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.ByIRebBsSmsgZEULHnPnh0oLXFMQqp53-1s93OY2k7RlK2OdMPjbt9izLYySAktbb_53iX4QYb4wSw_qwX4AA-kCEX9rS2h3s6FD832oF3MdhLC17UJXGPH3QLQZipn6c4B-_sY9VYzsnHz2E7RBYNhao3X7fcUHmOLOR0YjY0KPShaLYYva_OnZcK7PyIWdoAE-vJcNtDYNsxWZJCzoo6Uws76WbaO5D2ZJnBXkZR6sm_R2Bc13pFb4DI5oA9fPdxxM9L9xOo5uYXRYyP7b3mSzBFIEmeyZWoCrIAc4P9NWbFtqOTDAnJMkH37oe7LzV3IJSpAmVBQHsML8LgPTQw',
            'content-type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      )
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            if (this.$analytics) {
              this.$analytics.logEvent('sharedDoc')
            }
            this.saved = true
            this.doc.date = body.time
          }
        })
    },
    save(type) {
      timeout = null

      let body
      switch (type) {
        case 'title':
          body = { title: this.doc.title, time: this.$moment().unix() }
          break
        case 'document':
          var delta = editor.getContents()
          body = { data: delta, time: this.$moment().unix() }
          break
        default:
          var delta = editor.getContents()
          body = {
            title: this.doc.title,
            data: delta,
            time: this.$moment().unix()
          }
      }
      let size = jsonSize(body)
      if (size > 3145728) {
        if (this.$analytics) {
          this.$analytics.logEvent('docToLarge')
        }
        this.saved = false
        this.$swal({
          title: this.$t('ErrorTypes.savingSize.title'),
          text: this.$t('ErrorTypes.savingSize.text'),
          icon: 'warning'
        })
        this.saveError = true
      } else {
        fetch(
          `${this.$store.getters.api}/api/v1/documents/${this.$route.params.user}/${this.$route.params.docId}`,
          {
            method: 'post',
            headers: {
              Authorization:
                'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY3YmFiYWFiYTEwNWFkZDZiM2ZiYjlmZjNmZjVmZTNkY2E0Y2VkYTEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiTW9vbiBHYXRlcyIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQWNIVHRmc0RJVmV2OEljcVFSMU50dkhQcERjMDEwRnlmWTVXNkJBODJOMT1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9ncmFwaGl0ZS04OGU0MSIsImF1ZCI6ImdyYXBoaXRlLTg4ZTQxIiwiYXV0aF90aW1lIjoxNjg2OTY3NDE5LCJ1c2VyX2lkIjoialFSODZCUHB1MWRGSzVWRTFkRkFaNEltNWxNMiIsInN1YiI6ImpRUjg2QlBwdTFkRks1VkUxZEZBWjRJbTVsTTIiLCJpYXQiOjE2ODY5NjgzNTQsImV4cCI6MTY4Njk3MTk1NCwiZW1haWwiOiJtb29uZ2F0ZXM1MDAwQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTEwNzk3NTE1MTY2NjYxNjQzMzI5Il0sImVtYWlsIjpbIm1vb25nYXRlczUwMDBAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.ByIRebBsSmsgZEULHnPnh0oLXFMQqp53-1s93OY2k7RlK2OdMPjbt9izLYySAktbb_53iX4QYb4wSw_qwX4AA-kCEX9rS2h3s6FD832oF3MdhLC17UJXGPH3QLQZipn6c4B-_sY9VYzsnHz2E7RBYNhao3X7fcUHmOLOR0YjY0KPShaLYYva_OnZcK7PyIWdoAE-vJcNtDYNsxWZJCzoo6Uws76WbaO5D2ZJnBXkZR6sm_R2Bc13pFb4DI5oA9fPdxxM9L9xOo5uYXRYyP7b3mSzBFIEmeyZWoCrIAc4P9NWbFtqOTDAnJMkH37oe7LzV3IJSpAmVBQHsML8LgPTQw',
              'content-type': 'application/json'
            },
            body: JSON.stringify(body)
          }
        )
          .then((res) => res.json())
          .then((res) => {
            if (res.success) {
              this.saved = true
              this.doc.date = body.time
              if (this.$analytics) {
                this.$analytics.logEvent('savedDoc', {
                  doc: this.$route.params.docId,
                  owner: this.$route.params.user
                })
              }
            } else {
              if (res.error == 'too large') {
                if (this.$analytics) {
                  this.$analytics.logEvent('docToLarge')
                }
                this.$swal({
                  title: this.$t('ErrorTypes.savingSize.title'),
                  text: this.$t('ErrorTypes.savingSize.text'),
                  icon: 'warning'
                })
                this.saveError = true
              } else {
                if (this.$analytics) {
                  this.$analytics.logEvent('errorSavingDoc', {
                    error: res.error
                  })
                }
                this.$swal({
                  title: this.$t('ErrorTypes.saving.title'),
                  text: this.$t('ErrorTypes.saving.text'),
                  icon: 'warning'
                })
                this.saveError = true
              }
            }
          })
      }
    },
    saveTitle() {
      this.saveError = false
      this.saved = false
      window.clearTimeout(timeout)
    }
  },
  mounted() {
    const options = {
      debug: 'warn',
      modules: {
        toolbar: {
          container: '#toolbar'
        }
      },
      theme: 'snow',
      placeholder: this.$t('compose')
    }
    window.addEventListener('beforeunload', (event) => {
      // Cancel the event as stated by the standard.
      if (!this.saved) {
        if (this.$analytics) {
          this.$analytics.logEvent('docNotSaved')
        }
        event.preventDefault()
        // Chrome requires returnValue to be set.
        event.returnValue = 'Not saved'
        this.save()
      }
    })

    editor = new Quill('#doc', options)
    editor.setContents('welcome')
    this.loaded = true
    this.trace.stop()
  }
}
</script>
<style>
.highlight {
  background-color: yellow;
}
.Unhighlight {
  background-color: white;
}
.chat-history{
  overflow: auto;
  max-height: 200px; /* Adjust the maximum height as needed */
}
</style>
