class Category {
    constructor({ id = null, nombre, descripcion = null, activo = true } = {}) {
        const name = String(nombre || "").trim();

        if (name.length < 2 || name.length > 100) {
            throw new Error("El nombre de la categoría debe tener entre 2 y 100 caracteres");
        }

        this.id = id;
        this.nombre = name;
        this.descripcion = descripcion ? String(descripcion).trim() : null;
        this.activo = activo !== false;
    }
}

module.exports = Category;
