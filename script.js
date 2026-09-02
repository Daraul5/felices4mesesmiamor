window.addEventListener('load', () => {
    generarParticulas();
    // CRÍTICO: Esperar a que las fuentes (Playfair y Lora) carguen completamente
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(construirLibro);
    } else {
        setTimeout(construirLibro, 500);
    }
});

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const book = document.getElementById('book');
        book.innerHTML = ''; 
        book.className = 'book state-closed-front'; // Reiniciar estado
        construirLibro(); // Volver a calcular
    }, 400); 
});

function generarParticulas() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        const size = Math.random() * 5 + 2;
        p.style.width = `${size}px`; p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}%`; p.style.top = `${Math.random() * 100}%`;
        p.style.animationDelay = `${Math.random() * 5}s`; p.style.animationDuration = `${Math.random() * 3 + 3}s`;
        p.style.background = Math.random() > 0.5 ? 'rgba(224, 195, 252, 0.6)' : 'rgba(255, 255, 255, 0.4)';
        p.style.boxShadow = `0 0 ${size * 2}px ${p.style.background}`;
        container.appendChild(p);
    }
}

function construirLibro() {
    const book = document.getElementById('book');
    const sourceText = document.getElementById('source-text').textContent;
    
    const paragraphs = sourceText.split(/\n\s*\n/).filter(p => p.trim() !== '');

    const measureBox = document.createElement('div');
    measureBox.className = 'content letter-content';
    measureBox.style.position = 'absolute';
    measureBox.style.visibility = 'hidden';
    measureBox.style.width = '100%'; 
    measureBox.style.height = '100%';
    book.appendChild(measureBox);

    const pageContents = [];
    let isFirstParagraph = true;
    
    for (const text of paragraphs) {
        const words = text.trim().split(/\s+/);
        let currentP = document.createElement('p');
        
        if (isFirstParagraph) {
            currentP.className = 'first-paragraph';
            isFirstParagraph = false;
        }

        // Decoración de firma
        if (text.includes("Por siempre tuyo")) {
            currentP.classList.add("signature-paragraph");
        }
        if (text.includes("David Raul")) {
            currentP.classList.add("signature-paragraph", "signature-name");
        }
        
        measureBox.appendChild(currentP);

        for (const word of words) {
            const oldText = currentP.textContent;
            currentP.textContent = oldText ? oldText + ' ' + word : word;
            
            const boxRect = measureBox.getBoundingClientRect();
            const style = window.getComputedStyle(measureBox);
            const paddingBottom = parseFloat(style.paddingBottom);
            
            // Aumentamos el margen de seguridad a 25px para evitar cortes verticales abruptos
            const maxBottom = boxRect.bottom - paddingBottom - 25; 
            
            const pRect = currentP.getBoundingClientRect();
            
            if (pRect.bottom > maxBottom) {
                currentP.textContent = oldText; 
                pageContents.push(measureBox.innerHTML); 
                
                measureBox.innerHTML = ''; 
                currentP = document.createElement('p');
                currentP.className = 'continued';
                
                if (text.includes("Por siempre tuyo")) currentP.classList.add("signature-paragraph");
                if (text.includes("David Raul")) currentP.classList.add("signature-paragraph", "signature-name");

                currentP.textContent = word;
                measureBox.appendChild(currentP);
            }
        }
    }
    if (measureBox.innerHTML.trim() !== '') {
        pageContents.push(measureBox.innerHTML);
    }
    book.removeChild(measureBox);

    const leavesData = [];
    const isMobile = window.innerWidth <= 768; 

    // Hoja 0: Portada con el corazón y texto
    leavesData.push({
        front: `<div class="front cover-page">
                    <div class="cover-design">
                        <div style="position: relative; width: 60%; display: flex; justify-content: center; align-items: center; margin-bottom: 30px;">
                            <svg viewBox="0 0 100 90" style="width: 100%; height: auto; stroke: var(--gold); fill: transparent; stroke-width: 1.5; filter: drop-shadow(0 0 5px rgba(173, 140, 59, 0.5)); overflow: visible;">
                                <path d="M50 85 C 20 55, 0 35, 15 15 C 25 2, 45 5, 50 20 C 55 5, 75 2, 85 15 C 100 35, 80 55, 50 85 Z"/>
                            </svg>
                            <h1 class="cover-title" style="position: absolute; text-align: center; font-size: min(2vw, 3vh); line-height: 1.3; width: 100%; margin: 0; top: 20%;">Felices<br>4 meses<br>mi amor</h1>
                        </div>
                        <p class="instruction">Toca la derecha para avanzar &rarr;</p>
                        <p class="instruction" style="font-size: 0.8em; opacity: 0.7; margin-top: 5px;">&larr; Toca la izquierda para retroceder</p>
                    </div>
                </div>`,
        back: `<div class="back paper-page"></div>`
    });

    const navInstruction = `<div class="page-footer-nav">&larr; Retroceder &nbsp;&nbsp;&nbsp; &starf; &nbsp;&nbsp;&nbsp; Avanzar &rarr;</div>`;

    if (isMobile) {
        for (let i = 0; i < pageContents.length; i++) {
            leavesData.push({
                front: `<div class="front paper-page"><div class="content letter-content">${pageContents[i]}</div></div>`,
                back: `<div class="back paper-page"></div>`
            });
        }
    } else {
        let i = 0;
        while(i < pageContents.length) {
            let frontContent = pageContents[i];
            let backContent = pageContents[i+1] || ''; 
            
            leavesData.push({
                front: `<div class="front paper-page"><div class="content letter-content">${frontContent}</div></div>`,
                back: `<div class="back paper-page"><div class="content letter-content">${backContent}</div>${navInstruction}</div>`
            });
            i += 2;
        }
    }

    // Hoja Final: Mensaje final modificado
    leavesData.push({
        front: `<div class="front paper-page">
                    <div class="content flex-center">
                        <h2 class="question" style="font-size: min(3vw, 4vh);">Mi tiempo contigo es lo que ilumina mi alma, mi amor</h2>
                        <div class="victorian-ornament">
                            <svg width="80" height="40" viewBox="0 0 100 50" fill="currentColor">
                                <path d="M50 45 C 20 45, 5 25, 20 10 C 30 0, 45 10, 50 20 C 55 10, 70 0, 80 10 C 95 25, 80 45, 50 45 Z" fill="none" stroke="currentColor" stroke-width="2"/>
                                <path d="M50 20 Q 50 35 35 35" fill="none" stroke="currentColor" stroke-width="1.5"/>
                                <path d="M50 20 Q 50 35 65 35" fill="none" stroke="currentColor" stroke-width="1.5"/>
                                <circle cx="50" cy="20" r="3" fill="currentColor"/>
                            </svg>
                        </div>
                        <p class="epub-message">Te amo con todo mi ser</p>
                    </div>
                </div>`,
        back: `<div class="back back-cover">
                    <div class="cover-design">
                        <div class="decoration" style="font-size: min(4vw, 5vh);">✧</div>
                    </div>
                </div>`
    });

    let currentZIndex = 100;
    const leaves = [];
    let activeLeafIndex = 0;

    leavesData.forEach((leafData, index) => {
        const leafElement = document.createElement('div');
        leafElement.className = 'page';
        
        const baseZ = leavesData.length - index;
        leafElement.dataset.baseZ = baseZ;
        leafElement.style.zIndex = baseZ;
        
        leafElement.innerHTML = leafData.front + leafData.back;
        book.appendChild(leafElement);
        leaves.push(leafElement);
    });

    function goNext() {
        if (activeLeafIndex < leaves.length) {
            const leaf = leaves[activeLeafIndex];
            leaf.classList.add('flipped');
            leaf.style.zIndex = currentZIndex++;
            
            if (activeLeafIndex === 0) book.classList.replace('state-closed-front', 'state-open');
            if (activeLeafIndex === leaves.length - 1) book.classList.replace('state-open', 'state-closed-back');
            
            activeLeafIndex++;
        }
    }

    function goPrev() {
        if (activeLeafIndex > 0) {
            activeLeafIndex--;
            const leaf = leaves[activeLeafIndex];
            leaf.classList.remove('flipped');
            leaf.style.zIndex = leaf.dataset.baseZ;
            
            if (activeLeafIndex === 0) book.classList.replace('state-open', 'state-closed-front');
            if (activeLeafIndex === leaves.length - 1) book.classList.replace('state-closed-back', 'state-open');
        }
    }

    document.querySelector('.scene').addEventListener('click', (e) => {
        if (e.target.closest('.epub-download-btn')) return;
        
        if (e.clientX > window.innerWidth / 2) {
            goNext();
        } else {
            goPrev();
        }
    });
}
