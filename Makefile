export PYTHONPATH := src

install:
	pip install -r requirements.txt
train:
	python -m diabetes_ods.train
report:
	python -m diabetes_ods.report
test:
	pytest -q
api:
	uvicorn app.main:app --reload
docker:
	docker build -t diabetes-ods3 . && docker run -p 8000:8000 diabetes-ods3
all: train report test
