// App core for TRAfrs PRO - localStorage, UI interactions, theme, validation, charts
(function() {
    // Theme toggle (topbar + sidebar)
    const applyTheme = (theme) => {
        if (theme === 'dark') document.body.classList.add('dark');
        else document.body.classList.remove('dark');
        localStorage.setItem('tr_theme', theme);
        const tbtn = document.getElementById('theme-toggle');
        if (tbtn) tbtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    };
    const storedTheme = localStorage.getItem('tr_theme') || 'light';
    applyTheme(storedTheme);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', () => applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark'));
    const btn2 = document.getElementById('theme-toggle-sidebar');
    if (btn2) btn2.addEventListener('click', () => applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark'));

    // Product storage helpers
    function getProducts() { try { return JSON.parse(localStorage.getItem('tr_products') || '[]'); } catch (e) { return []; } }

    function saveProducts(list) { localStorage.setItem('tr_products', JSON.stringify(list)); }

    // Eliminar producto
    async function eliminarProducto(id) {

        if (!confirm('¿Eliminar producto?')) {
            return;
        }

        try {

            await fetch(
                `http://localhost:3000/api/productos/${id}`, {
                    method: 'DELETE'
                }
            );

            renderProducts();

        } catch (error) {

            console.error(error);

        }

    }

    // Mostrar productos
    async function renderProducts() {

        const list = document.getElementById('prod-list');

        if (!list) return;

        try {

            const respuesta = await fetch(
                'http://localhost:3000/api/productos'
            );

            const productos = await respuesta.json();

            list.innerHTML = '';

            if (productos.length === 0) {

                list.innerHTML =
                    '<p>No hay productos registrados</p>';

                return;

            }

            productos.forEach((p) => {

                const item = document.createElement('div');

                item.className = 'item';

                item.innerHTML = `
        <div>
          <strong>${p.nombre}</strong>
          <div class="muted">
            ${p.tipo} • ${p.descripcion}
          </div>
        </div>

        <div>
          <button
            class="btn small"
            onclick="eliminarProducto(${p.id})">
            Eliminar
          </button>
        </div>
      `;

                list.appendChild(item);

            });

        } catch (error) {

            console.error(error);

        }

    }

    // Add product form
    document.addEventListener('DOMContentLoaded', () => {
        // Mostrar usuario logueado
        const usuarioGuardado = localStorage.getItem('usuario');

        if (usuarioGuardado) {

            const usuario = JSON.parse(usuarioGuardado);

            const bienvenida = document.getElementById('bienvenida');

            if (bienvenida) {
                bienvenida.textContent =
                    `Bienvenido, ${usuario.nombre}`;
            }

        }

        const logoutBtn = document.getElementById('logout-btn');

        if (logoutBtn) {

            logoutBtn.addEventListener('click', () => {

                localStorage.removeItem('usuario');

                window.location.href = 'login.html';

            });

        }

        window.eliminarProducto = eliminarProducto;

        renderProducts();

        const form = document.getElementById('add-form');

        if (form) {

            form.addEventListener('submit', async(e) => {

                e.preventDefault();

                const nombre = document.getElementById('nombre').value.trim();
                const descripcion = document.getElementById('descripcion').value.trim();
                const tipo = document.getElementById('tipo').value;

                if (!nombre || !descripcion) {
                    alert('Por favor completa todos los campos');
                    return;
                }

                try {

                    const respuesta = await fetch(
                        'http://localhost:3000/api/productos', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                nombre,
                                descripcion,
                                tipo
                            })
                        }
                    );

                    const datos = await respuesta.json();

                    alert(datos.mensaje);

                    form.reset();

                } catch (error) {

                    console.error(error);

                    alert('Error al guardar producto');

                }

            });

        }

        // Simple login/register simulation (local only for demo)
        const lform = document.getElementById('login-form');

        if (lform) {

            lform.addEventListener('submit', async(e) => {

                e.preventDefault();

                const email = document.getElementById('login-user').value.trim();
                const password = document.getElementById('login-pass').value;

                try {

                    const respuesta = await fetch(
                        'http://localhost:3000/api/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                email,
                                password
                            })
                        }
                    );

                    const datos = await respuesta.json();

                    if (respuesta.ok) {

                        localStorage.setItem(
                            'usuario',
                            JSON.stringify(datos.usuario)
                        );

                        alert(datos.mensaje);

                        window.location.href = 'dashboard.html';

                    } else {

                        alert(datos.mensaje);

                    }

                } catch (error) {

                    console.error(error);

                    alert('Error de conexión');

                }

            });

        }

        // Dashboard chart
        const chartCanvas = document.getElementById('txChart');
        if (chartCanvas && typeof Chart !== 'undefined') {
            const prods = getProducts();
            // Create demo data from product count per type
            const counts = { metodo: 0, servicio: 0, transaccion: 0, comercio: 0 };
            prods.forEach(p => { counts[p.tipo] = (counts[p.tipo] || 0) + 1 });
            const data = {
                labels: ['Método', 'Servicio', 'Transacción', 'Comercio'],
                datasets: [{
                    label: 'Productos por tipo',
                    data: [counts.metodo, counts.servicio, counts.transaccion, counts.comercio],
                    backgroundColor: ['rgba(30,136,229,0.9)', 'rgba(3,169,244,0.85)', 'rgba(0,150,136,0.85)', 'rgba(153,102,255,0.85)'],
                    borderRadius: 6
                }]
            };
            new Chart(chartCanvas.getContext('2d'), { type: 'bar', data, options: { responsive: true, plugins: { legend: { display: false } } } });
            // update stat
            const statTrans = document.getElementById('stat-trans');
            if (statTrans) statTrans.textContent = prods.length * 3; // demo: transactions ~= 3x products
        }

    });

})();