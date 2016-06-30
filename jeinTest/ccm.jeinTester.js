ccm.component( {
  name: 'jeintester',
  config: {
    html:  [ ccm.store, { local: 'https://raw.githubusercontent.com/MrLawbreaker/ccm-developer/master/jeinTest/templates.json' } ],
    key:   'questionSet',
    store: [ ccm.store, { store: 'yesnoQuestion' } ],
    style: [ ccm.load, 'https://raw.githubusercontent.com/MrLawbreaker/ccm-developer/master/jeinTest/style.css' ],
    user: [ccm.instance, 'http://kaul.inf.h-brs.de/ccm/components/user2.js'],
    adminList: [""]
  },
  Instance: function () {
    var t1,t2;
    var loggedIn = false;
    var self = this;
    self.render = function ( callback ) {
        var element = ccm.helper.element( self );
        
        self.store.get(self.key, function ( dataset ){
            //Falls dataset leer is hole es aus der datei und lade es auf den server
            if(dataset === null){
                self.store.set({
                    key: self.key, 
                    questions: []
                });
            }
            else{
                proceed(dataset);
            }
        });
        
        function proceed(dataset){
            var answered = 0;
            var questions = dataset.questions;
            
            element.html(ccm.helper.html( self.html.get( "start" ),{
                starttext:"Hier nun einige Fragen zum beantworten. Viel Erfolg!",
                onclickstart:function(){
                    hideElement(".start");
                    hideElement(".btnEdit");
                    showElement(".questions");
                    t1 = new Date().getTime();
                },
                onclickedit:function(){
                    onEdit();
                },
                onclicklogin:function(){
                    self.user.login(function(){
                        //OnLogin
                        loggedIn = true;
                        if(self.adminList.indexOf(self.user.data().key) >= 0){
                            showElement(".btnEdit")
                        }
                        hideElement(".btnLogin");
                    });
                }
            }));
            
            ccm.helper.find(self, ".start").parent().append(ccm.helper.html(self.html.get( "questions" )));
            
            var questions_div = ccm.helper.find(self, ".questions");
            
            for(i = 0; i < questions.length; i++){
                var question = questions[i];
                questions_div.append(ccm.helper.html(self.html.get("question"),{
                    qid: i+1,
                    text: ccm.helper.val(question.question),
                    onsubmittrue: function(){
                        checkAnswer($(this).data("btnid"),true);
                    },
                    onsubmitfalse: function(){
                        checkAnswer($(this).data("btnid"),false);
                    }
                }));
            }
            
            hideElement(".questions");
            hideElement(".btnEdit");
            

            function onEdit(){
                var find = ccm.helper.find;
                hideElement(".start");
                hideElement(".btnEdit");
                showElement(".questions");
                applyEditMode();

                var question_divs = find(self, ".question");
                question_divs.append(function(index){
                    $(this).append(ccm.helper.html(self.html.get("questionCheckbox"),{
                        chkid:index,
                        checked:dataset.questions[index].correct
                    }));
                });
                
                find(self,".questions").append(ccm.helper.html(self.html.get("editButtons"),{
                    onclickAddNew:function(){
                        var $newQuestion = $(ccm.helper.html(self.html.get("question")));
                        $newQuestion.insertBefore(".editButtons");
                        $newQuestion.append(ccm.helper.html(self.html.get("questionCheckbox"),{
                            checked:false
                        }));
                        applyEditMode();
                    },
                    onclickApply:function(){
                        saveQuestions();
                    },
                    onclickCancel:function(){
                        self.render();
                    }
                }));
                
                function applyEditMode(){
                    find(self, ".btnWahr,.btnFalsch").remove();
                    find(self, ".question > .text").prop("contenteditable",true);
                }
            }
            
            function saveQuestions(){
                var newDataset = {
                    key:self.key,
                    questions:[]
                };
                
                var questions = ccm.helper.find(self,".question");
                questions.each(function(index, question){
                    var questionText = $(question).find(".text").text();
                    var questionCorrect = $(question).find(".qCheckbox").prop("checked");
                    
                    questionText = ccm.helper.val(questionText); //Validierung des Strings
                    
                    var newQuestion = {
                        question:questionText,
                        correct:questionCorrect
                    };
                    
                    newDataset.questions.push(newQuestion);
                });
                
                dataset = newDataset;
                self.store.set(newDataset);
                
                alert("Fragen gespeichert!");
                
            }
            
            function checkAnswer(qid, answer){
                console.log("Frage Nummer "+qid+" wurde beantwortet mit "+answer);
                
                var question_div = ccm.helper.find(self, "[data-qid='"+qid+"']");
                
                if(questions[qid-1].correct === answer ){
                    question_div.addClass("correct");
                }
                else{
                    question_div.addClass("wrong");
                }
                
                question_div.addClass("answered");
                
                ccm.helper.find(self, "[data-qid='"+qid+"']"+" button").prop("disabled",true);
                
                answered++;
                
                if(answered === questions.length){
                    finishTest();
                }
            }
            
            function finishTest(){
                t2 = new Date().getTime();
                
                var correct = ccm.helper.find(self,".correct").length;
                var grammar = correct > 1 ? "Fragen" : "Frage";
                var time = (t2 - t1)/1000;
                
                questions_div.parent().append(ccm.helper.html(self.html.get("results"),{
                    onclickrestart: function(){self.render();},
                    result:"Du hast "+ correct +" "+ grammar +" in "+ time +" Sekunden richtig beantwortet."
                }));
            }
            
            function hideElement(elementIdentifier){
                ccm.helper.find(self, elementIdentifier).css("visibility","hidden");
                ccm.helper.find(self, elementIdentifier).css("position","absolute");
            }
            
            function showElement(elementIdentifier){
                ccm.helper.find(self, elementIdentifier).css("visibility","visible");
                ccm.helper.find(self, elementIdentifier).css("position","static");
            }
            
            if(callback) callback();
        }
    };
  }
} );