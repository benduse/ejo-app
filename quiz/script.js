class QuizApp {
  constructor() {
    Object.assign(this, {
      currentQuestion: 0, score: 0, correctCount: 0, wrongCount: 0,
      questions: [], endedEarly: false, timerEnabled: false, timer: null
    });
    this.init();
  }

  async init() {
    const ids = [
      'question','choices','progress-bar','result-container',
      'quiz-container','final-score','languageSelect','difficultySelect',
      'score','download-btn','end-quiz-btn','print-pdf-btn',
      'difficulty-badge','leaderboard-container','leaderboard-list',
      'timer','timer-container'
    ];
    ids.forEach(id => this[this.toCamel(id)] = document.getElementById(id));

    this.difficultySelect.addEventListener('change', () => {
      this.timerEnabled = this.difficultySelect.value !== 'all';
      this.restartQuiz();
    });

    [['restart-btn',()=>this.restartQuiz()],
     [this.languageSelect,()=>this.handleLanguageChange()],
     [this.downloadBtn,()=>this.downloadResults()],
     [this.endQuizBtn,()=>this.endQuiz()],
     [this.printPdfBtn,()=>this.printResultsPDF()]
    ].forEach(([el, fn]) => 
      (el instanceof HTMLElement ? el : document.getElementById(el)).addEventListener('click' , fn)
    );

    await this.loadQuestions();
    this.loadLeaderboard();
    this.showQuestion();
  }

  toCamel(id) { return id.replace(/-([a-z])/g, (_,c)=>c.toUpperCase()); }

  async loadQuestions() {
    const map = { french:'/questions/french.json', spanish:'/questions/spanish.json', ikinyarwanda:'/questions/ikinyarwanda.json' };
    try {
      const res = await fetch(map[this.languageSelect.value] || map.ikinyarwanda);
      const data = await res.json();
      this.questions = data.questions.map((q,i)=>({
        ...q, difficulty: i >= 35 ? 'hard' : i >= 10 ? 'medium' : 'easy'
      }));

      const diff = this.difficultySelect?.value;
      if (diff && diff !== 'all') this.questions = this.questions.filter(q=>q.difficulty===diff);

      this.questions = this.shuffleArray(this.questions).slice(0,10);
      this.resetStats();
    } catch {
      alert('Failed to load questions.');
      this.questions=[];
    }
  }

  shuffleArray(a) {
    for (let i=a.length-1;i>0;i--) {
      const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  async handleLanguageChange() {
    await this.loadQuestions(); this.restartQuiz();
    document.body.className = ''; 
    document.body.classList.add(`lang-${this.languageSelect.value}`);
    this.difficultyBadge.className='difficulty-badge difficulty-easy';
  }

  showQuestion() {
    if (this.timer) clearInterval(this.timer);
    if (!this.questions.length) return this.noQuestions();

    if (this.currentQuestion < this.questions.length) {
      const q = this.questions[this.currentQuestion], d = q.difficulty||'easy';
      this.difficultyBadge.textContent = d[0].toUpperCase()+d.slice(1);
      this.difficultyBadge.className = `difficulty-badge difficulty-${d}`;
      this.progressBar.style.width = `${(this.currentQuestion/this.questions.length)*100}%`;
      this.question.textContent = q.question;

      this.choices.innerHTML='';
      q.choices.forEach(c=>{
        const b=document.createElement('button');
        b.textContent=c; b.className='choice-btn';
        b.onclick=()=>this.checkAnswer(c);
        this.choices.appendChild(b);
      });

      this.timerEnabled ? this.setTimer(d) : this.timerContainer.style.display='none';
    } else this.showResult();
  }

  noQuestions(){
    this.question.textContent='No questions available for the selected options.';
    this.choices.innerHTML=''; this.progressBar.style.width='0%';
    this.timerContainer.style.display='none';
  }

  setTimer(d){
    this.timeLeft=d==='easy'?10:d==='medium'?9:8;
    this.timerElement.textContent=this.timeLeft;
    this.startTimer(); this.timerContainer.style.display='';
    this.timerContainer.style.color='';
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer=setInterval(()=>{
      this.timerElement.textContent=--this.timeLeft;
      if (this.timeLeft<=0){
        clearInterval(this.timer);
        this.timerContainer.style.color='#d84315';
        this.checkAnswer(null,true);
      }
    },1000);
  }

  checkAnswer(choice,timedOut=false){
    if (this.timer) clearInterval(this.timer);
    const q=this.questions[this.currentQuestion]; if(!q) return;
    const correct=choice===q.correctAnswer;

    document.querySelectorAll('.choice-btn').forEach(b=>{
      b.disabled=true;
      if(b.textContent===q.correctAnswer) b.classList.add('correct');
      else if(b.textContent===choice&&!correct&&choice) b.classList.add('incorrect');
    });

    timedOut?this.wrongCount++:
      correct?(this.score+=5,this.correctCount++):
              (this.score--,this.wrongCount++);

    this.scoreElement.textContent=this.score;
    setTimeout(()=>{
      this.wrongCount>=5?this.showResult(true):(this.currentQuestion++,this.showQuestion());
    },1200);
  }

  showResult(early=false){
    this.quizContainer.classList.add('hide');
    this.resultContainer.classList.remove('hide');
    const endMsg=early?' (Quiz ended: 5 wrong answers)':this.endedEarly?' (Quiz ended by user)':'';
    this.finalScore.textContent=`${this.score} out of ${this.questions.length*5}${endMsg}`;
    
    [this.downloadBtn,this.printPdfBtn].forEach(b=>
      this.questions.length>=25||this.endedEarly?b.classList.remove('hide'):b.classList.add('hide')
    );

    this.saveScoreToLeaderboard(); this.displayLeaderboard();
    if(this.questions.length>=25||this.isHighScore()) window.launchConfetti?.();
  }

  makeResultsText(){
    const lang=this.languageSelect.options[this.languageSelect.selectedIndex].text;
    const total=this.questions.length;
    return `Polyglot Quiz Results\n\nLanguage: ${lang}\nTotal Questions: ${total}\nCorrect Answers: ${this.correctCount}\nWrong Answers: ${this.wrongCount}\nFinal Score: ${this.score} out of ${total*5}`;
  }

  downloadResults(){
    const blob=new Blob([this.makeResultsText()],{type:'text/plain'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=`quiz_results_${this.languageSelect.value}_${new Date().getFullYear()}.txt`;
    document.body.appendChild(a); a.click(); a.remove();
  }

  endQuiz(){ this.endedEarly=true; this.showResult(); }

  printResultsPDF(){
    const win=window.open('','','width=600,height=700');
    win.document.write(`<html><head><title>Quiz Results PDF</title></head><body><pre style="font-size:1.2rem;">${this.makeResultsText()}</pre></body></html>`);
    win.document.close(); win.print();
  }

  async restartQuiz() {
    this.resetStats(); if(this.timer) clearInterval(this.timer);
    this.quizContainer.classList.remove('hide');
    this.resultContainer.classList.add('hide');
    this.scoreElement.textContent=this.score;
    await this.loadQuestions(); this.showQuestion();
  }

  resetStats(){ this.currentQuestion=this.score=this.correctCount=this.wrongCount=0; this.endedEarly=false; }

  loadLeaderboard(){ this.leaderboard=JSON.parse(localStorage.getItem('polyglot_leaderboard')||'[]'); }

  saveScoreToLeaderboard(){
    let name=localStorage.getItem('polyglot_player_name')||prompt('Enter your name for the leaderboard:','Player')||'Player';
    localStorage.setItem('polyglot_player_name',name);
    this.leaderboard.push({name,score:this.score,date:new Date().toLocaleDateString()});
    this.leaderboard.sort((a,b)=>b.score-a.score).splice(10);
    localStorage.setItem('polyglot_leaderboard',JSON.stringify(this.leaderboard));
  }

  displayLeaderboard(){
    this.leaderboardContainer.classList.remove('hide');
    this.leaderboardList.innerHTML=this.leaderboard.map(e=>`<li>${e.name} - ${e.score} (${e.date})</li>`).join('');
  }

  isHighScore(){ return !this.leaderboard.length||this.score>this.leaderboard.at(-1).score; }
}

document.addEventListener('DOMContentLoaded',()=>new QuizApp());
