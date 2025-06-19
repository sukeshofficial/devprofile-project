import os
import uuid
import subprocess
import tempfile
from jinja2 import Environment, BaseLoader

def generate_pdf_resume_latex(data: dict) -> bytes:
    # Load LaTeX template from file
    template_path = "utils/sukesh_resume_template.tex"
    with open(template_path, "r", encoding="utf-8") as f:
        tex_template = f.read()
        

    env = Environment(
        loader=BaseLoader(),
        autoescape=False,
        block_start_string="{%",
        block_end_string="%}",
        variable_start_string="{{",
        variable_end_string="}}",
        comment_start_string="{#",
        comment_end_string="#}",
    )

    template = env.from_string(tex_template)
    rendered = template.render(**data)

    # Print the rendered template (optional)
    print("===== Rendered LaTeX START =====")
    print(rendered)
    print("===== Rendered LaTeX END =======")

    # Use a temporary directory
    with tempfile.TemporaryDirectory() as tmpdirname:
        uid = uuid.uuid4().hex
        tex_path = os.path.join(tmpdirname, f"{uid}.tex")
        pdf_path = os.path.join(tmpdirname, f"{uid}.pdf")

        with open(tex_path, "w", encoding="utf-8") as f:
            f.write(rendered)

        # Run pdflatex
        subprocess.run(["pdflatex", "-output-directory", tmpdirname, tex_path], check=True)

        with open(pdf_path, "rb") as f:
            pdf_data = f.read()

    return pdf_data
