import { useEffect, useMemo, useState } from "react";
import * as authService from "./services/authService";
import * as catalogService from "./services/catalogService";
import ProfileActions from "./components/ProfileActions";
import * as orderService from "./services/orderService";
import * as userService from "./services/userService";
import "./App.css";
import "./redesign.css";

const money = (value) =>
    new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN"
    }).format(Number(value || 0));

const orderStatusText = {
    pendiente: "En revisión",
    pagado: "Pago confirmado",
    preparando: "Preparando tu pedido",
    enviado: "En camino",
    entregado: "Entregado",
    cancelado: "Cancelado"
};

const orderStatusHelp = {
    pendiente: "Recibimos tu pedido y estamos verificando los detalles.",
    pagado: "El pago fue confirmado y pronto prepararemos tu pedido.",
    preparando: "Estamos preparando tus productos para el envío.",
    enviado: "Tu pedido ya salió. Pronto llegará a tu domicilio.",
    entregado: "El pedido fue entregado. ¡Esperamos que lo disfrutes!",
    cancelado: "Este pedido se canceló y el inventario fue actualizado."
};

function storedUser() {
    try {
        return JSON.parse(localStorage.getItem("store_user") || "null");
    } catch {
        return null;
    }
}

function storedCart() {
    try {
        return JSON.parse(localStorage.getItem("store_cart") || "[]");
    } catch {
        return [];
    }
}

function App() {
    const [user, setUser] = useState(storedUser);
    const [view, setView] = useState("catalog");
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [cart, setCart] = useState(storedCart);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [search, setSearch] = useState("");
    const [authMode, setAuthMode] = useState("");
    const [authData, setAuthData] = useState({ nombre: "", email: "", password: "" });
    const [shipping, setShipping] = useState({
        direccion_envio: "",
        ciudad: "",
        codigo_postal: "",
        pais: "México"
    });
    const [paymentMethod, setPaymentMethod] = useState("contra_entrega");
    const [categoryForm, setCategoryForm] = useState({
        id: null,
        nombre: "",
        descripcion: ""
    });
    const [productForm, setProductForm] = useState({
        id: null,
        categoria_id: "",
        nombre: "",
        slug: "",
        sku: "",
        descripcion: "",
        precio: "",
        stock: 0,
        activo: true
    });
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");

    async function refreshCatalog() {
        try {
            const [categoryRows, productRows] = await Promise.all([
                catalogService.getCategories(),
                catalogService.getProducts()
            ]);
            setCategories(categoryRows);
            setProducts(productRows);
        } catch (err) {
            setError(err.message);
        }
    }

    async function refreshOrders() {
        try {
            setOrders(user.rol === "administrador"
                ? await orderService.getAllOrders()
                : await orderService.getMyOrders());
        } catch (err) {
            setError(err.message);
        }
    }

    async function refreshAdminUsers() {
        try {
            setUsers(await userService.getUsers());
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        refreshCatalog();
    }, []);

    useEffect(() => {
        localStorage.setItem("store_cart", JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        if (user && view === "orders") refreshOrders();
        if (user?.rol === "administrador" && view === "admin") {
            refreshOrders();
            refreshAdminUsers();
        }
    }, [user, view]);

    const visibleProducts = useMemo(() => {
        const term = search.trim().toLowerCase();
        return products.filter((product) => {
            const matchesCategory =
                !categoryFilter ||
                String(product.categoria_id) === String(categoryFilter);
            const matchesText =
                !term ||
                (product.nombre || "").toLowerCase().includes(term) ||
                (product.descripcion || "").toLowerCase().includes(term) ||
                (product.sku || "").toLowerCase().includes(term);
            return product.activo && matchesCategory && matchesText;
        });
    }, [products, categoryFilter, search]);

    const cartLines = useMemo(() => cart.map((line) => ({
        ...line,
        product: products.find((product) =>
            String(product.id) === String(line.producto_id)
        )
    })).filter((line) => line.product), [cart, products]);

    const cartTotal = cartLines.reduce(
        (sum, line) => sum + Number(line.product.precio) * line.cantidad,
        0
    );

    function addToCart(product) {
        if (Number(product.stock) < 1) {
            setError("Este producto no tiene existencias.");
            return;
        }
        setError("");
        setCart((current) => {
            const found = current.find(
                (line) => String(line.producto_id) === String(product.id)
            );
            if (!found) {
                return [...current, { producto_id: product.id, cantidad: 1 }];
            }
            return current.map((line) =>
                String(line.producto_id) === String(product.id)
                    ? { ...line, cantidad: Math.min(line.cantidad + 1, Number(product.stock)) }
                    : line
            );
        });
    }

    function changeQuantity(productId, delta) {
        setCart((current) => current.flatMap((line) => {
            if (String(line.producto_id) !== String(productId)) return [line];
            const product = products.find(
                (item) => String(item.id) === String(productId)
            );
            const next = line.cantidad + delta;
            if (next < 1) return [];
            if (product && next > Number(product.stock)) return [line];
            return [{ ...line, cantidad: next }];
        }));
    }

    async function submitAuth(event) {
        event.preventDefault();
        setError("");
        try {
            const nextUser = authMode === "register"
                ? await authService.register(authData)
                : await authService.login(authData);
            setUser(nextUser);
            setAuthMode("");
            setAuthData({ nombre: "", email: "", password: "" });
            setNotice("Sesión iniciada como " + nextUser.nombre);
        } catch (err) {
            setError(err.message);
        }
    }

    function logout() {
        authService.logout();
        setUser(null);
        setView("catalog");
        setOrders([]);
        setNotice("Sesión cerrada");
    }

    async function checkout(event) {
        event.preventDefault();
        setError("");
        if (!user) {
            setAuthMode("login");
            setError("Inicia sesión para finalizar tu compra.");
            return;
        }

        try {
            const order = await orderService.createOrder({
                ...shipping,
                metodo_pago: paymentMethod,
                items: cart.map((line) => ({
                    producto_id: Number(line.producto_id),
                    cantidad: line.cantidad
                }))
            });
            setCart([]);
            setNotice("¡Gracias! Recibimos tu pedido. Puedes consultar su avance en “Mis pedidos”.");
            await refreshCatalog();
        } catch (err) {
            setError(err.message);
            await refreshCatalog();
        }
    }

    async function saveCategory(event) {
        event.preventDefault();
        setError("");
        try {
            if (categoryForm.id) {
                await catalogService.updateCategory(categoryForm.id, categoryForm);
                setNotice("Categoría actualizada");
            } else {
                await catalogService.createCategory(categoryForm);
                setNotice("Categoría creada");
            }
            setCategoryForm({ id: null, nombre: "", descripcion: "" });
            await refreshCatalog();
        } catch (err) {
            setError(err.message);
        }
    }

    async function saveProduct(event) {
        event.preventDefault();
        setError("");
        const data = {
            ...productForm,
            categoria_id: Number(productForm.categoria_id),
            precio: Number(productForm.precio),
            stock: Number(productForm.stock)
        };

        try {
            if (productForm.id) {
                await catalogService.updateProduct(productForm.id, data);
                setNotice("Producto actualizado");
            } else {
                await catalogService.createProduct(data);
                setNotice("Producto creado");
            }
            setProductForm({
                id: null,
                categoria_id: categories[0]?.id || "",
                nombre: "",
                slug: "",
                sku: "",
                descripcion: "",
                precio: "",
                stock: 0,
                activo: true
            });
            await refreshCatalog();
        } catch (err) {
            setError(err.message);
        }
    }

    async function removeProduct(id) {
        if (!window.confirm("¿Eliminar este producto?")) return;
        try {
            await catalogService.deleteProduct(id);
            setNotice("Producto eliminado");
            await refreshCatalog();
        } catch (err) {
            setError(err.message);
        }
    }

    async function removeCategory(id) {
        if (!window.confirm("¿Eliminar esta categoría?")) return;
        try {
            await catalogService.deleteCategory(id);
            setNotice("Categoría eliminada");
            await refreshCatalog();
        } catch (err) {
            setError(err.message);
        }
    }

    async function changeOrderStatus(id, estado) {
        try {
            await orderService.updateOrderStatus(id, estado);
            setNotice("Estado del pedido actualizado");
            await refreshOrders();
        } catch (err) {
            setError(err.message);
        }
    }

    async function cancelOrder(id) {
        const motivo = window.prompt("Cuéntanos por qué deseas cancelar este pedido (mínimo 5 caracteres):");
        if (motivo === null) return;
        if (motivo.trim().length < 5) {
            setError("Escribe un motivo de al menos 5 caracteres.");
            return;
        }
        try {
            await orderService.cancelOrder(id, motivo.trim());
            setNotice("Tu pedido se canceló y el inventario fue actualizado.");
            await refreshOrders();
            await refreshCatalog();
        } catch (err) {
            setError(err.message);
        }
    }

    async function removeUser(id) {
        if (String(id) === String(user.id)) {
            setError("No puedes eliminar tu propia cuenta de administrador.");
            return;
        }
        if (!window.confirm("¿Eliminar este usuario?")) return;
        try {
            await userService.deleteUser(id);
            setNotice("Usuario eliminado");
            await refreshAdminUsers();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="store-shell">
            <header className="topbar">
                <button className="brand" onClick={() => { setView("catalog"); setSearch(""); setCategoryFilter(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                    <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 8h16l1 13H3L4 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg></span>
                    <span className="brand-name">VITRINA<span className="brand-sub">TODO PARA TU DÍA</span></span>
                </button>
                <nav className="main-nav">
                    <button className={view === "catalog" ? "active" : ""} onClick={() => { setView("catalog"); setCategoryFilter(""); setSearch(""); window.setTimeout(() => document.getElementById("catalog-grid")?.scrollIntoView({ behavior: "smooth" }), 120); }}>Catálogo</button>
                    {user && <button className={view === "orders" ? "active" : ""} onClick={() => setView("orders")}>Mis pedidos</button>}
                    {user?.rol === "administrador" && <button className={view === "admin" ? "active" : ""} onClick={() => setView("admin")}>Administración</button>}
                </nav>
                <div className="account-actions">
                    <button className="cart-link" onClick={() => document.getElementById("cart-panel")?.scrollIntoView({ behavior: "smooth" })}>
                        Bolsa <span>{cart.reduce((sum, item) => sum + item.cantidad, 0)}</span>
                    </button>
                    <ProfileActions user={user} onLogout={logout} onLogin={() => setAuthMode("login")} onOrders={() => setView("orders")} onAdmin={() => setView("admin")} />
                </div>
            </header>

            {(notice || error) && (
                <div className={error ? "toast toast-error" : "toast"}>
                    <span>{error || notice}</span>
                    <button onClick={() => { setError(""); setNotice(""); }}>×</button>
                </div>
            )}

            {view === "catalog" && (
                <>
                    <section className="hero">
                        <div>
                            <p className="eyebrow">DISEÑO PARA TODOS LOS DÍAS</p>
                            <h1>Encuentra algo<br />que te acompañe.</h1>
                            <p className="hero-copy">Productos útiles, seleccionados con cuidado y listos para ti.</p>
                            <button className="primary-button" onClick={() => document.getElementById("catalog-grid")?.scrollIntoView({ behavior: "smooth" })}>Explorar catálogo <span>↓</span></button>
                        </div>
                        <div className="hero-art" aria-hidden="true">
                            <div className="hero-orbit orbit-one" />
                            <div className="hero-orbit orbit-two" />
                            <div className="hero-product">
                            <img className="hero-slide hero-slide-one" src="https://images.unsplash.com/photo-1638969725799-40c112559cbc?auto=format&fit=crop&w=1600&h=900&q=85" alt="" />
                            <img className="hero-slide hero-slide-two" src="https://images.unsplash.com/photo-1784537642955-9d371c0cbf91?auto=format&fit=crop&w=1600&h=900&q=85" alt="" />
                            <img className="hero-slide hero-slide-three" src="https://images.unsplash.com/photo-1777628530456-bb93d3a03faf?auto=format&fit=crop&w=1600&h=900&q=85" alt="" />
                            <img className="hero-slide hero-slide-four" src="https://images.unsplash.com/photo-1780538778860-7aaa9a0ee84b?auto=format&fit=crop&w=1600&h=900&q=85" alt="" />
                        </div>
                            <span className="hero-caption">SELECCIÓN 2026</span>
                        </div>
                    </section>

                    <div className="shop-layout">
                        <main className="catalog-main" id="catalog-grid">
                            <div className="section-heading">
                                <div>
                                    <p className="eyebrow">DESCUBRE</p>
                                    <h2>Catálogo</h2>
                                </div>
                                <input className="search-box" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar productos..." />
                            </div>

                            <div className="category-filters">
                                <button className={!categoryFilter ? "filter-chip selected" : "filter-chip"} onClick={() => setCategoryFilter("")}>Todo</button>
                                {categories.filter((category) => category.activo).map((category) => (
                                    <button key={category.id} className={String(categoryFilter) === String(category.id) ? "filter-chip selected" : "filter-chip"} onClick={() => setCategoryFilter(category.id)}>
                                        {category.nombre}
                                    </button>
                                ))}
                            </div>

                            <div className="product-grid">
                                {visibleProducts.map((product, index) => (
                                    <article className="product-card" key={product.id}>
                                        <div className={"product-art product-art-" + (index % 4)}>
                                            <span className="product-art-fallback">{(product.nombre || "N").slice(0, 1).toUpperCase()}</span>
                                            {product.image_url && (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.nombre}
                                                    loading="lazy"
                                                    onError={(event) => { event.currentTarget.style.display = "none"; }}
                                                />
                                            )}
                                            <small>{product.categoria_nombre || "VITRINA"}</small>
                                        </div>
                                        <div className="product-info">
                                            <div className="product-meta"><span>{product.sku}</span><span>{Number(product.stock) > 0 ? "Disponible" : "Agotado"}</span></div>
                                            <h3>{product.nombre}</h3>
                                            <p>{product.descripcion || "Un básico para acompañarte todos los días."}</p>
                                            <div className="product-buy">
                                                <strong>{money(product.precio)}</strong>
                                                <button disabled={Number(product.stock) < 1} onClick={() => addToCart(product)}>Agregar <span>+</span></button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                                {visibleProducts.length === 0 && <p className="empty-state">No encontramos productos con esos filtros.</p>}
                            </div>
                        </main>

                        <aside className="cart-panel" id="cart-panel">
                            <div className="cart-heading">
                                <div><p className="eyebrow">TU COMPRA</p><h2>Tu bolsa <span>{cartLines.length}</span></h2></div>
                            </div>
                            {cartLines.length === 0
                                ? <p className="empty-cart">Tu bolsa está vacía.<br />Agrega algo que te guste.</p>
                                : <div className="cart-lines">
                                    {cartLines.map((line) => (
                                        <div className="cart-line" key={line.producto_id}>
                                            <div className="cart-line-art">{line.product.image_url ? <img src={line.product.image_url} alt={line.product.nombre} loading="lazy" /> : <span>{line.product.nombre.slice(0, 1).toUpperCase()}</span>}</div>
                                            <div className="cart-line-info">
                                                <strong>{line.product.nombre}</strong>
                                                <span>{money(line.product.precio)}</span>
                                                <div className="quantity-control">
                                                    <button onClick={() => changeQuantity(line.producto_id, -1)}>−</button>
                                                    <span>{line.cantidad}</span>
                                                    <button onClick={() => changeQuantity(line.producto_id, 1)}>+</button>
                                                </div>
                                            </div>
                                            <button className="remove-line" onClick={() => changeQuantity(line.producto_id, -line.cantidad)}>×</button>
                                        </div>
                                    ))}
                                    <div className="cart-total"><span>Subtotal estimado</span><strong>{money(cartTotal)}</strong></div>
                                    <p className="cart-note">El total final se calcula en el servidor con los precios vigentes.</p>
                                    <form className="checkout-form" onSubmit={checkout}>
                                        <details className="checkout-disclosure"><summary>Entrega y pago <span>＋</span></summary><h3>Entrega</h3>
                                        <input required placeholder="Dirección" value={shipping.direccion_envio} onChange={(event) => setShipping({ ...shipping, direccion_envio: event.target.value })} />
                                        <label className="payment-choice">
                                            Método de pago
                                            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                                                <option value="contra_entrega">Pago contra entrega</option>
                                                <option value="transferencia">Transferencia bancaria</option>
                                                <option value="tarjeta_demo">Tarjeta de demostración (sin cobro real)</option>
                                            </select>
                                        </label>
                                        <p className="payment-note">La tienda registra tu elección. Los pagos con tarjeta son solo demostrativos.</p>
                                        <div className="checkout-row">
                                            <input required placeholder="Ciudad" value={shipping.ciudad} onChange={(event) => setShipping({ ...shipping, ciudad: event.target.value })} />
                                            <input required placeholder="C.P." value={shipping.codigo_postal} onChange={(event) => setShipping({ ...shipping, codigo_postal: event.target.value })} />
                                        </div>
                                        <button className="primary-button full-width" type="submit">Finalizar pedido <span>→</span></button></details>
                                    </form>
                                </div>}
                        </aside>
                    </div>
                </>
            )}

            {view === "orders" && (
                <section className="page-section">
                    <p className="eyebrow">TU ACTIVIDAD</p>
                    <h1>{user?.rol === "administrador" ? "Pedidos de la tienda" : "Mis pedidos"}</h1>
                    <div className="order-list">
                        {orders.map((order) => (
                            <article className="order-card" key={order.id}>
                                <div className="order-top">
                                    <div><span className="order-number">PEDIDO #{order.id}</span><strong>{money(order.total)}</strong></div>
                                    <span className={"status-pill status-" + order.estado}>{orderStatusText[order.estado] || order.estado}</span>
                                </div>
                                <p className="order-date">{new Date(order.created_at).toLocaleString("es-MX")} · {order.ciudad}</p>
                                <p className="order-status-help">{orderStatusHelp[order.estado] || "Consulta aquí las novedades de tu pedido."}</p>
                                <p className="order-payment">Pago: {({ tarjeta_demo: "Tarjeta de demostración", transferencia: "Transferencia bancaria", contra_entrega: "Contra entrega" })[order.metodo_pago] || "Contra entrega"}</p>
                                {order.motivo_cancelacion && <p className="order-cancel-reason"><strong>Motivo de cancelación:</strong> {order.motivo_cancelacion}</p>}
                                <div className="order-items">
                                    {(order.items || []).map((item, index) => (
                                        <span key={index}>{item.nombre_producto} × {item.cantidad}</span>
                                    ))}
                                </div>
                                {order.estado === "pendiente" && <button className="text-button danger-text" onClick={() => cancelOrder(order.id)}>Cancelar pedido</button>}
                                {user?.rol === "administrador" && (
                                    <div className="status-control">
                                        <select defaultValue="" onChange={(event) => event.target.value && changeOrderStatus(order.id, event.target.value)}>
                                            <option value="" disabled>Cambiar estado…</option>
                                            {["pagado", "preparando", "enviado", "entregado"].map((status) => <option key={status} value={status}>{status}</option>)}
                                        </select>
                                    </div>
                                )}
                            </article>
                        ))}
                        {orders.length === 0 && <p className="empty-state">Todavía no hay pedidos.</p>}
                    </div>
                </section>
            )}

            {view === "admin" && user?.rol === "administrador" && (
                <section className="page-section admin-page">
                    <p className="eyebrow">PANEL DE CONTROL</p>
                    <h1>Administración</h1>
                    <div className="admin-grid">
                        <section className="admin-card">
                            <h2>{categoryForm.id ? "Editar categoría" : "Nueva categoría"}</h2>
                            <form onSubmit={saveCategory} className="admin-form">
                                <input required minLength="2" maxLength="100" placeholder="Nombre" value={categoryForm.nombre} onChange={(event) => setCategoryForm({ ...categoryForm, nombre: event.target.value })} />
                                <textarea placeholder="Descripción" value={categoryForm.descripcion} onChange={(event) => setCategoryForm({ ...categoryForm, descripcion: event.target.value })} />
                                <button className="primary-button" type="submit">{categoryForm.id ? "Guardar cambios" : "Crear categoría"}</button>
                                {categoryForm.id && <button type="button" className="text-button" onClick={() => setCategoryForm({ id: null, nombre: "", descripcion: "" })}>Cancelar edición</button>}
                            </form>
                            <div className="admin-list">
                                {categories.map((category) => (
                                    <div className="admin-list-row" key={category.id}>
                                        <span>{category.nombre}</span>
                                        <div>
                                            <button className="text-button" onClick={() => setCategoryForm({ id: category.id, nombre: category.nombre, descripcion: category.descripcion || "" })}>Editar</button>
                                            <button className="text-button danger-text" onClick={() => removeCategory(category.id)}>Eliminar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="admin-card">
                            <h2>{productForm.id ? "Editar producto" : "Nuevo producto"}</h2>
                            <form onSubmit={saveProduct} className="admin-form">
                                <select required value={productForm.categoria_id} onChange={(event) => setProductForm({ ...productForm, categoria_id: event.target.value })}>
                                    <option value="">Selecciona categoría</option>
                                    {categories.map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}
                                </select>
                                <input required placeholder="Nombre" value={productForm.nombre} onChange={(event) => setProductForm({ ...productForm, nombre: event.target.value })} />
                                <div className="checkout-row">
                                    <input required placeholder="slug-ejemplo" value={productForm.slug} onChange={(event) => setProductForm({ ...productForm, slug: event.target.value })} />
                                    <input required placeholder="SKU" value={productForm.sku} onChange={(event) => setProductForm({ ...productForm, sku: event.target.value })} />
                                </div>
                                <textarea placeholder="Descripción" value={productForm.descripcion} onChange={(event) => setProductForm({ ...productForm, descripcion: event.target.value })} />
                                <div className="checkout-row">
                                    <input required type="number" min="0" step="0.01" placeholder="Precio MXN" value={productForm.precio} onChange={(event) => setProductForm({ ...productForm, precio: event.target.value })} />
                                    <input required type="number" min="0" step="1" placeholder="Stock" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} />
                                </div>
                                <button className="primary-button" type="submit">{productForm.id ? "Guardar cambios" : "Crear producto"}</button>
                                {productForm.id && <button type="button" className="text-button" onClick={() => setProductForm({ id: null, categoria_id: categories[0]?.id || "", nombre: "", slug: "", sku: "", descripcion: "", precio: "", stock: 0, activo: true })}>Cancelar edición</button>}
                            </form>
                            <div className="admin-list">
                                {products.map((product) => (
                                    <div className="admin-list-row" key={product.id}>
                                        <span>{product.nombre} · {money(product.precio)} · stock {product.stock}</span>
                                        <div>
                                            <button className="text-button" onClick={() => setProductForm({ ...product, categoria_id: String(product.categoria_id) })}>Editar</button>
                                            <button className="text-button danger-text" onClick={() => removeProduct(product.id)}>Eliminar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <section className="admin-card admin-wide">
                        <h2>Usuarios</h2>
                        <div className="admin-list">
                            {users.map((item) => (
                                <div className="admin-list-row" key={item.id}>
                                    <span>{item.nombre} · {item.email} · {item.rol}</span>
                                    {String(item.id) !== String(user.id) && <button className="text-button danger-text" onClick={() => removeUser(item.id)}>Eliminar</button>}
                                </div>
                            ))}
                            {users.length === 0 && <p className="empty-state">No hay usuarios registrados.</p>}
                        </div>
                    </section>
                </section>
            )}

            {authMode && (
                <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setAuthMode("")}>
                    <section className="auth-modal">
                        <button className="modal-close" onClick={() => setAuthMode("")}>×</button>
                        <p className="eyebrow">{authMode === "register" ? "ÚNETE A VITRINA" : "QUÉ BUENO VERTE"}</p>
                        <h2>{authMode === "register" ? "Crea tu cuenta" : "Inicia sesión"}</h2>
                        <form onSubmit={submitAuth} className="admin-form">
                            {authMode === "register" && <input required minLength="2" placeholder="Nombre" value={authData.nombre} onChange={(event) => setAuthData({ ...authData, nombre: event.target.value })} />}
                            <input required type="email" placeholder="Correo electrónico" value={authData.email} onChange={(event) => setAuthData({ ...authData, email: event.target.value })} />
                            <input required minLength="6" type="password" placeholder="Contraseña" value={authData.password} onChange={(event) => setAuthData({ ...authData, password: event.target.value })} />
                            <button className="primary-button full-width" type="submit">{authMode === "register" ? "Crear cuenta" : "Entrar"} <span>→</span></button>
                        </form>
                        <p className="auth-switch">
                            {authMode === "register" ? "¿Ya tienes cuenta?" : "¿Primera vez aquí?"}
                            <button className="text-button" onClick={() => setAuthMode(authMode === "register" ? "login" : "register")}>
                                {authMode === "register" ? "Iniciar sesión" : "Crear cuenta"}
                            </button>
                        </p>
                    </section>
                </div>
            )}

            <footer className="site-footer">
                <span>VITRINA · Taller de Desarrollo 3</span>
                <span>Arquitectura hexagonal · PostgreSQL · React</span>
            </footer>
        </div>
    );
}

export default App;
