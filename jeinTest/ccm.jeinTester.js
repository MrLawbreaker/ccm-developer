ccm.component( {
  name: 'jeinTester',
  config: {
    html:  [ ccm.store, { local: 'templates.json' } ],
    key:   'questionSet',
    store: [ ccm.store, { url: 'dataset.json', store: 'questiontest' } ],
    style: [ ccm.load, 'style.css' ]
  },
  Instance: function () {
    var sendSet = true; //Wenn true, werden Daten aus dem json zum Server zum Speichern gesendet
    var self = this;
    self.render = function ( callback ) {
        var element = ccm.helper.element( self );
        
        self.store.get(self.key, function ( dataset ){
            //Falls dataset leer is hole es aus der datei und lade es auf den server
            if((dataset !== null) && !sendSet){
                proceed(dataset);
            }
            else{
                $.get("dataset.json",function(data){
                    self.store.set(data, function(){
                        self.store.get(self.key,proceed(dataset));
                    });
                });
            }
        });
        
        
        
        function proceed(dataset){
            var answered = 0;
            var questions = dataset.questions;
            
            element.html(ccm.helper.html( self.html.get( "start" ),{
                starttext:"Hier nun einige Fragen zum beantworten. Viel Erfolg!",
                onclickstart:function(){
                    ccm.helper.find(self, ".questions").css("visibility","visible");
                    ccm.helper.find(self, ".start").css("visibility","hidden");
                }
            }));
            
            ccm.helper.find(self, ".start").parent().append(ccm.helper.html(self.html.get( "questions" )));
            
            var questions_div = ccm.helper.find(self, ".questions");
            
            for(i = 0; i < questions.length; i++){
                var question = questions[i];
                questions_div.append(ccm.helper.html(self.html.get("question"),{
                    qid: ccm.helper.val(question.qid),
                    text: ccm.helper.val(question.question),
                    onsubmittrue: function(){
                        checkAnswer($(this).data("btnid"),true);
                    },
                    onsubmitfalse: function(){
                        checkAnswer($(this).data("btnid"),false);
                    }
                }));
            }
            
            
            
            function checkAnswer(qid, answer){
                console.log("Frage Nummer "+qid+" wurde beantwortet mit "+answer);
                
                var question_div = ccm.helper.find(self, "#"+qid);
                
                if(questions[qid-1].correct === answer ){
                    question_div.addClass("correct");
                }
                else{
                    question_div.addClass("wrong");
                }
                
                question_div.addClass("answered");
                
                ccm.helper.find(self, "#"+qid+" button").prop("disabled",true);
                
                answered++;
                
                if(answered === questions.length){
                    finishTest();
                }
                
            }
            
            function finishTest(){
                questions_div.parent().append(ccm.helper.html(self.html.get("results"),{
                    onclickrestart: function(){location.reload();},
                    result:"Du hast "+ccm.helper.find(self,".correct").length+" Fragen richtig beantwortet."
                }));
            }
            
            if(callback) callback();
        }
    };
  }
} );