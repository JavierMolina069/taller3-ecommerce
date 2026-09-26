import { useEffect, useRef, useState } from "react";

export default function ProfileActions({ user, onLogout, onLogin, onOrders, onAdmin }) {
    const storageKey = `vitrina.avatar.${user?.id ?? user?.email ?? "cuenta"}`;
    const [avatar, setAvatar] = useState("");
    const [open, setOpen] = useState(false);
    const photoInput = useRef(null);

    useEffect(() => {
        setAvatar(localStorage.getItem(storageKey) || "");
    }, [storageKey]);

    function changePhoto(event) {
        const file = event.currentTarget.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            window.alert("Elige un archivo de imagen.");
            return;
        }
        if (file.size > 1500000) {
            window.alert("Elige una foto menor de 1.5 MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const image = String(reader.result);
                localStorage.setItem(storageKey, image);
                setAvatar(image);
            } catch {
                window.alert("No se pudo guardar la foto en este navegador.");
            }
        };
        reader.readAsDataURL(file);
        event.currentTarget.value = "";
    }

    if (!user) {
        return <button className="account-button" onClick={onLogin}>Iniciar sesión</button>;
    }

    const name = user.nombre || user.email || "Usuario";
    const initials = name.trim().split(/\s+/).slice(0, 2)
        .map((part) => part[0]).join("").toUpperCase();

    function run(action) {
        setOpen(false);
        action?.();
    }

    return (
        <div
            className="profile-menu"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button
                type="button"
                className="welcome-user"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                onFocus={() => setOpen(true)}
            >
                <span className="profile-avatar">
                    {avatar ? <img src={avatar} alt="" /> : <span>{initials}</span>}
                </span>
                <span className="welcome-copy">
                    <small>Bienvenido</small>
                    <strong>{name}</strong>
                </span>
                <span className="profile-chevron">⌄</span>
            </button>

            {open && (
                <div className="profile-dropdown">
                    <p className="profile-greeting">¡Hola, {name}!</p>
                    <div className="profile-detail"><span>Nombre</span><strong>{name}</strong></div>
                    <div className="profile-detail"><span>Correo</span><strong>{user.email}</strong></div>
                    <div className="profile-detail"><span>Cuenta</span><strong>{user.rol || "cliente"}</strong></div>

                    <button onClick={() => { setOpen(false); photoInput.current?.click(); }}>
                        Cambiar foto de perfil
                    </button>
                    <button onClick={() => run(onOrders)}>Mis pedidos</button>
                    {user.rol === "administrador" && (
                        <button onClick={() => run(onAdmin)}>Administración</button>
                    )}
                    <button className="profile-logout" onClick={() => run(onLogout)}>
                        Cerrar sesión
                    </button>
                </div>
            )}

            <input
                ref={photoInput}
                className="profile-file-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                aria-label="Elegir foto de perfil"
                onChange={changePhoto}
            />
        </div>
    );
}
