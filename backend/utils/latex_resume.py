import os
import uuid
import re
import subprocess
import tempfile
from jinja2 import Environment, BaseLoader

def escape_tex(value):
    """
    Escapes LaTeX special characters in strings.
    """
    if not isinstance(value, str):
        return value  # Don't process non-strings

    tex_escape_map = {
        '&': r'\&',
        '%': r'\%',
        '$': r'\$',
        '#': r'\#',
        '_': r'\_',
        '{': r'\{',
        '}': r'\}',
        '~': r'\textasciitilde{}',
        '^': r'\textasciicircum{}',
        '\\': r'\textbackslash{}',
    }

    return re.sub(
        '|'.join(re.escape(key) for key in tex_escape_map),
        lambda match: tex_escape_map[match.group()],
        value
    )

def generate_pdf_resume_latex(data: dict) -> bytes:
    # Load LaTeX template from file
    template_path = "utils/sukesh_resume_template.tex"
    with open(template_path, "r", encoding="utf-8") as f:
        tex_template = f.read()

    # Setup Jinja2 environment with escape_tex filter
    env = Environment(
        loader=BaseLoader(),
        autoescape=False,
        block_start_string="{%",
        block_end_string="%}",
        variable_start_string="{{",
        variable_end_string="}}",
        comment_start_string="{#",
        comment_end_string="#}"
    )
    env.filters["escape_tex"] = escape_tex  # ✅ Register the filter here

    # Render LaTeX with escaped values
    template = env.from_string(tex_template)
    rendered = template.render(**data)

    # Debug: print LaTeX output
    print("===== Rendered LaTeX START =====")
    print(rendered)
    print("===== Rendered LaTeX END =======")

    # Use a temporary directory to generate the PDF
    with tempfile.TemporaryDirectory() as tmpdirname:
        uid = uuid.uuid4().hex
        tex_path = os.path.join(tmpdirname, f"{uid}.tex")
        pdf_path = os.path.join(tmpdirname, f"{uid}.pdf")

        with open(tex_path, "w", encoding="utf-8") as f:
            f.write(rendered)

        # Run pdflatex to compile the resume
        subprocess.run(
            ["pdflatex", "-interaction=nonstopmode", "-output-directory", tmpdirname, tex_path],
            check=True
        )

        with open(pdf_path, "rb") as f:
            pdf_data = f.read()

    return pdf_data
