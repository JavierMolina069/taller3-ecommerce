class Product {
    constructor(data = {}) {
        const categoriaId = Number(data.categoria_id);
        const precio = Number(data.precio);
        const stock = Number(data.stock ?? 0);
        const nombre = String(data.nombre || "").trim();
        const slug = String(data.slug || "").trim().toLowerCase();
        const sku = String(data.sku || "").trim().toUpperCase();

        if (!Number.isInteger(categoriaId) || categoriaId < 1) {
            throw new Error("La categoría debe ser válida");
        }
        if (nombre.length < 2 || nombre.length > 160) {
            throw new Error("El nombre debe tener entre 2 y 160 caracteres");
        }
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            throw new Error("El slug debe usar letras minúsculas, números y guiones");
        }
        if (!sku || sku.length > 80) {
            throw new Error("El SKU es obligatorio y debe tener máximo 80 caracteres");
        }
        if (!Number.isFinite(precio) || precio < 0) {
            throw new Error("El precio debe ser un número mayor o igual a cero");
        }
        if (!Number.isInteger(stock) || stock < 0) {
            throw new Error("El stock debe ser un entero mayor o igual a cero");
        }

        this.id = data.id || null;
        this.categoria_id = categoriaId;
        this.nombre = nombre;
        this.slug = slug;
        this.sku = sku;
        this.descripcion = data.descripcion ? String(data.descripcion).trim() : null;
        this.precio = precio;
        this.stock = stock;
        const imageUrl = data.image_url ? String(data.image_url).trim() : null;
        if (imageUrl) {
            let parsedImageUrl;
            try {
                parsedImageUrl = new URL(imageUrl);
            } catch {
                throw new Error("La imagen debe tener una URL válida");
            }
            if (parsedImageUrl.protocol !== "https:") {
                throw new Error("La imagen debe usar HTTPS");
            }
        }

        this.image_url = imageUrl;
        this.activo = data.activo !== false;
    }
}

module.exports = Product;
