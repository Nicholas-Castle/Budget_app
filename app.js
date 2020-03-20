// Data Controller
let budgetController = (function() {
  
  let Expense =  function(id, disc, val){
    this.id = id;
    this.disc = disc;
    this.val = val;
    this.percentage = -1;
  }

  Expense.prototype.calcPercent = function(totalInc) {
    if (totalInc > 0) {
      this.percentage = Math.round((this.val / totalInc) * 100);
    } else {
      this.percentage = -1;
    }
  } 

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }

  let Income =  function(id, disc, val){
    this.id = id;
    this.disc = disc;
    this.val = val;
  }

  let data = {
    allItems:{
      exp:[],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  let calTotal = (type) => {
    let sum = 0;
    data.allItems[type].forEach((current) => {
      sum += current.val;
    });
    data.totals[type] = sum;
  };
  
  return {
    addItem: function(type, discription, value) {
      let newItem, id;
      // create new id
      if(data.allItems[type].length > 0) {
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        id = 0;
      }
      

      // create new item base on in or exp
      if(type === 'exp') {
        newItem = new Expense(id, discription, value);
      } else if (type ===  'inc'){
        newItem = new Income(id, discription, value);
      }
     
      // push in into data structure
      data.allItems[type].push(newItem);

      // return the new element
      return newItem;
    },

    delItem: function(type, id) {
      let ids, index;
       ids = data.allItems[type].map(function(current){
        return current.id;
      });

      index = ids.indexOf(id);

      if (index != -1) {
        data.allItems[type].splice(index, 1);
      }

    },

    calBudget: function(){
      // calc total income/expens
      calTotal('exp');
      calTotal('inc');
      //calc budget income - expense
      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0) {
        // cal th percentage of income that has been spent
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
      
    },

    calcPercent: function() {
      data.allItems.exp.forEach(function(current) {
        current.calcPercent(data.totals.inc);
      });
    },

    getPercentage: function() {
      let allPercents = data.allItems.exp.map(function(current){
        return current.getPercentage();
      });
      return allPercents;
    },

   

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    }
  };

})();

// UI Controller
 let UIController = (function(){
  
  let DOMstrings = {
    inputType: '.add__type',
    inputDiscription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLablel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expPercentageLbl: '.item__percentage',
    dateLbl: '.budget__title--month'

  };
  let formatNum = function(num, type) {
    // + or minus before num with two decimal points
    // and a comma in the thousands
    let numSplit,int,nDecimal;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');

    int = numSplit[0];
    if(int.length > 3){
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    } 

    nDecimal = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + nDecimal;

  };
  let nodeListForEach = function(list, callback) {
    for(let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return{
        type: document.querySelector(DOMstrings.inputType).value, // either income/expense
        disc: document.querySelector(DOMstrings.inputDiscription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      let html, newHtml, element;

      // create html str with place holder text
      if(type === 'inc'){
        element = DOMstrings.incomeContainer;

        html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp'){
        element = DOMstrings.expenseContainer;

        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // replace the place holder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.disc);
      newHtml =  newHtml.replace('%value%', formatNum(obj.val, type));

      // insert the html into the dom
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    },
    
    deleteListItem: function(selectorId){
      
      let el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);

    },

    clearFields: function() {
     let fields, fieldsArr;
     
     fields = document.querySelectorAll(DOMstrings.inputDiscription + ', ' + DOMstrings.inputValue);

     fieldsArr = Array.prototype.slice.call(fields);

     fieldsArr.forEach(function(current, index, array) {
       current.value = "";
     });

      fieldsArr[0].focus();
      
    },

    displayBudget: function(obj) {
      let type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNum(obj.budget, type);
      document.querySelector(DOMstrings.incomeLablel).textContent = formatNum(obj.totalInc,'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNum(obj.totalExp, 'exp');
      
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else  {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    displayMonth: function() {
      let now, year, month, months;
      now = new Date();
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLbl).textContent = months[month] + ' ' + year;


    },

    displayPercentages: function(percentage){
      let fields = document.querySelectorAll(DOMstrings.expPercentageLbl);

      nodeListForEach(fields, function(current, index){
        if(percentage[index] > 0){
          current.textContent = percentage[index] + '%';
        } else {
          current.textContent = '---';
        }
        
      });
    },
    changedType: function() {

      let fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDiscription + ',' +
        DOMstrings.inputValue);
      
        nodeListForEach(fields, function(current){
          current.classList.toggle('red-focus');
        }); 

        document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

    },

    getDomStr: function() {
      return DOMstrings;
    }
  };

 })();

 // Global Controller 
 let controller = (function(budgetContlr, UIContlr){
  let setEventListener = function(){
    let DOM = UIContlr.getDomStr();

    document.querySelector(DOM.inputBtn).addEventListener('click', addItemCntrl);

    document.addEventListener('keypress', function(e) {
        
      if(e.keyCode === 13 || e.which === 13){
        addItemCntrl();
      }
    });
    
    document.querySelector(DOM.container).addEventListener('click', cntrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UIContlr.changedType);

  };



  let updateBudget = function() {
      // calc budget
      budgetContlr.calBudget();
      // return the budget
      let budget = budgetContlr.getBudget();
      // display the budget in the ui
      UIContlr.displayBudget(budget);
  };

  let updatePercent = function() {
    // calc percent
    budgetContlr.calcPercent();
    // read precents from budget cntrl
    let percentages = budgetContlr.getPercentage();
    // update ui with percentates
    UIContlr.displayPercentages(percentages);
  };

  let addItemCntrl = function() {
    let input, newItem;

    // get field input data
    input = UIContlr.getInput();
    if(input.discription !== "" && !isNaN(input.value) && input.value > 0) {
    // add item to data controller
    newItem = budgetContlr.addItem(input.type, input.disc, input.value);
    // add the item to the ui
    UIContlr.addListItem(newItem, input.type);
    // clear all fields
    UIContlr.clearFields();
    // calc and update 
    updateBudget();
    // calc and update percentages
    updatePercent();
    
    }
  };


  let cntrlDeleteItem = function(event){
    let itemId, splitId, type, ID;

    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(itemId) {

      splitId = itemId.split('-');
      type = splitId[0];
      ID = parseInt(splitId[1]);

      // delete the item from the data structure
      budgetContlr.delItem(type, ID);
      // delte the item from the ui
      UIController.deleteListItem(itemId);
      // update and show the new budget
      updateBudget();
      // calc and update percentages
      updatePercent();

    }

  };

  return {
    init: function() {
      console.log('app has started');
      UIContlr.displayMonth();
      UIContlr.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setEventListener();
    }
  }
 
 })(budgetController, UIController);

controller.init();