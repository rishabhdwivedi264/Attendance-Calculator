
  const totalInput = document.getElementById('total');
  const presentInput = document.getElementById('present');
  const targetInput = document.getElementById('target');
  const calcBtn = document.getElementById('calcBtn');

  const errorBox = document.getElementById('errorBox');
  const resultStack = document.getElementById('resultStack');

  const pctValue = document.getElementById('pctValue');
  const pctBar = document.getElementById('pctBar');
  const actionLabel = document.getElementById('actionLabel');
  const actionValue = document.getElementById('actionValue');
  const actionSub = document.getElementById('actionSub');
  const statusPill = document.getElementById('statusPill');
  const statusValue = document.getElementById('statusValue');

  function showError(msg){
    errorBox.textContent = msg;
    errorBox.classList.add('show');
    resultStack.classList.remove('show');
  }

  function clearError(){
    errorBox.textContent = '';
    errorBox.classList.remove('show');
  }

  function calculate(){
    clearError();

    const total = parseFloat(totalInput.value);
    const present = parseFloat(presentInput.value);
    const target = parseFloat(targetInput.value);

    // --- validation / edge cases ---
    if (Number.isNaN(total) || Number.isNaN(present) || Number.isNaN(target)) {
      showError('Please fill in all three fields with numbers.');
      return;
    }
    if (total <= 0) {
      showError('Total classes must be greater than 0.');
      return;
    }
    if (present < 0 || present > total) {
      showError('Classes attended can\'t be negative or more than total classes.');
      return;
    }
    if (target <= 0 || target > 100) {
      showError('Target percentage must be between 1 and 100.');
      return;
    }

    const percentage = (present / total) * 100;

    // update percentage pill
    pctValue.textContent = percentage.toFixed(2) + '%';
    pctBar.style.width = Math.min(percentage, 100).toFixed(1) + '%';

    const missed = total - present;

    if (percentage >= target) {
      // how many upcoming classes can be skipped and stay at/above target
      // present / (total + x) >= target/100  ->  x <= present*100/target - total
      if (target === 0) {
        actionLabel.textContent = 'Classes you can miss';
        actionValue.textContent = '∞';
        actionSub.textContent = 'Any target of 0% is always met.';
      } else {
        const rawBunk = (present * 100 / target) - total;
        const bunkable = Math.max(0, Math.floor(rawBunk + 1e-9));
        actionLabel.textContent = 'Classes you can miss';
        actionValue.textContent = bunkable;
        actionSub.textContent = bunkable > 0
          ? `You can skip up to ${bunkable} more class${bunkable === 1 ? '' : 'es'} and stay at ${target}% or above.`
          : `Missing even one more class will drop you below ${target}%.`;
      }
      statusPill.classList.remove('status-risk');
      statusValue.textContent = 'Safe';
    } else {
      if (target === 100) {
        // 100% target: only reachable if nothing has ever been missed
        if (missed === 0) {
          actionLabel.textContent = 'Classes needed';
          actionValue.textContent = '0';
          actionSub.textContent = 'You already have a perfect attendance record.';
        } else {
          actionLabel.textContent = 'Classes needed';
          actionValue.textContent = '—';
          actionSub.textContent = `100% isn't mathematically reachable once ${missed} class${missed === 1 ? '' : 'es'} have been missed. Attending every class from now on gets you closer, but never all the way there.`;
        }
      } else {
        // (present + y) / (total + y) >= target/100
        const denom = 1 - (target / 100);
        const rawNeeded = ((target / 100) * total - present) / denom;
        const needed = Math.max(0, Math.ceil(rawNeeded - 1e-9));
        actionLabel.textContent = 'Classes needed';
        actionValue.textContent = needed;
        actionSub.textContent = `Attend the next ${needed} class${needed === 1 ? '' : 'es'} in a row to reach ${target}%.`;
      }
      statusPill.classList.add('status-risk');
      statusValue.textContent = 'Below target';
    }

    resultStack.classList.add('show');
  }

  calcBtn.addEventListener('click', calculate);

  [totalInput, presentInput, targetInput].forEach(el => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') calculate();
    });
  });